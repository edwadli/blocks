import flask
from flask import json
from flask_dance.contrib import google
import logging
from oauthlib import oauth2
import os
import uuid
from werkzeug import security

from env import pymongo_env
from env import secret_keeper

from src.utils import pymongo_utils
from src.utils import proto_utils
from src.web.tasks_app import task_pb2
from src.web.tasks_app import user_pb2

_USER_TABLE = pymongo_env.PUBLIC_DB['task_app_users']
_TASKS_TABLE = pymongo_env.PUBLIC_DB['task_app_tasks']
# _USER_TABLE.drop()
# _TASKS_TABLE.drop()

# Load secrets.
_SECRET_NAMESPACE = 'TASKS_APP_SECRETS'
_TASK_APP_SECRET = secret_keeper.ReadSecret(
  'TASK_APP_SECRET', _SECRET_NAMESPACE)
_GOOGLE_OAUTH_CLIENT_ID = secret_keeper.ReadSecret(
  'GOOGLE_OAUTH_CLIENT_ID', _SECRET_NAMESPACE)
_GOOGLE_OAUTH_CLIENT_SECRET = secret_keeper.ReadSecret(
  'GOOGLE_OAUTH_CLIENT_SECRET', _SECRET_NAMESPACE)

# Set up Flask with Google OAuth login.
app = flask.Flask(__name__)
app.secret_key = _TASK_APP_SECRET
google_blueprint = google.make_google_blueprint(
  client_id=_GOOGLE_OAUTH_CLIENT_ID,
  client_secret=_GOOGLE_OAUTH_CLIENT_SECRET,
  scope=[
      "https://www.googleapis.com/auth/plus.me",
      "https://www.googleapis.com/auth/userinfo.email",
  ]
)
app.register_blueprint(google_blueprint, url_prefix="/login")
# Disable logging
# log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)


def MergeRequestToMessage(message, fields=None):
  """Merges the incoming request json values from 'fields' into 'message'."""
  request_data = flask.request.get_json()
  if fields is not None:
    request_data = {field: request_data[field] for field in request_data
                    if field in fields}
  proto_utils.MergeDictToProto(request_data, message)


def LoadUser():
  """Returns the user from the request, or None if not logged in."""
  try:
    assert google.google.authorized
    resp = google.google.get("/oauth2/v2/userinfo")
    assert resp.ok, resp.text
    google_info = resp.json()
    google_id = google_info.get("id", None)
    assert google_id
  except (oauth2.TokenExpiredError, AssertionError):
    return
  # Load (or create) the User from Database.
  user = user_pb2.User()
  exists = pymongo_utils.GetMessage(
      {"auth": {"google_oauth": google_id}}, _USER_TABLE, user)
  if not exists:
    user = user_pb2.User()
    user.auth.google_oauth = google_id
    user.email = google_info.get("email", "")
    user.name = google_info.get("name", "")
    pymongo_utils.AddMessage(user, _USER_TABLE, id_field="user_id")
  return user
  

@app.route("/")
def index():
#   return flask.send_file("resources/index.html")
  return flask.send_from_directory("resources", "index.html")

@app.route("/css/<path:file>", methods=["GET"])
def send_css(file):
  if file.split(".")[-1] != "css":
    return flask.abort(404)
  return flask.send_from_directory("resources", file)

@app.route("/js/<path:file>", methods=["GET"])
def send_js(file):
  if file.split(".")[-1] != "js":
    return flask.abort(404)
  return flask.send_from_directory("resources", file)

@app.route("/jsx/<path:file>", methods=["GET"])
def send_jsx(file):
  if file.split(".")[-1] != "jsx":
    return flask.abort(404)
  return flask.send_from_directory("resources", file)

@app.route("/login/google")
def login_google():
  return flask.redirect(flask.url_for("google.login"))

# APIs

@app.route("/api/profile/read", methods=["POST"])
def read_profile():
  user = LoadUser()
  if user is None:
    return flask.abort(401)
  result = {}
  proto_utils.MergeProtoToDict(user, result)
  return json.dumps(result)


@app.route("/api/profile/update", methods=["POST"])
def update_profile():
  user = LoadUser()
  if user is None:
    return flask.abort(401)
  # Read request data to update 'name' or 'email' fields.
  user_data = user_pb2.User()
  try:
    MergeRequestToMessage(user_data, ["name", "email"])
  except:
    return flask.abort(400)
  pymongo_utils.UpdateMessage(
    {"user_id": user.user_id}, user_data, _USER_TABLE)
  return "success"


@app.route("/api/profile/logout", methods=["POST"])
def logout_profile():
  token = google_blueprint.token["access_token"]
  resp = google.google.post(
    "https://accounts.google.com/o/oauth2/revoke",
    params={"token": token},
    headers={"Content-Type": "application/x-www-form-urlencoded"})
  return "success"


@app.route("/api/task/read", methods=["POST"])
def get_tasks():
  user = LoadUser()
  if user is None:
    return flask.abort(401)
  result = _TASKS_TABLE.find({"user_id": user.user_id})
  tasks = []
  for task in result:
    task = dict(task)
    del task['_id']
    tasks.append(task)
  return json.dumps({"results": tasks})


# Helper function for updating a Task.
def update_task(field_names):
  user = LoadUser()
  if user is None:
    return flask.abort(401)
  # Parse the POSTed data from the request.
  task = task_pb2.Task()
  merged_doc = {}
  try:
    # Note 'field_name' is either "description" or "state".
    MergeRequestToMessage(task, ["task_id"] + field_names)
    task.user_id = user.user_id
    update_existing = task.HasField("task_id")
    if not update_existing:
      task.task_id = uuid.uuid4().hex
    for tag in task.tags:
      tag.tag_id = uuid.uuid4().hex
    proto_utils.MergeProtoToDict(task, merged_doc)
  except:
    return flask.abort(400)
  # Update the database.
  if update_existing:
    # Update existing task.
    filter = {"task_id": task.task_id, "user_id": task.user_id}
    if len(task.tags) > 0:
      # Merge with the current tags.
      current_task = task_pb2.Task()
      pymongo_utils.GetMessage(filter, _TASKS_TABLE, current_task)
      for tag in current_task.tags:
        task.tags.add().CopyFrom(tag)
    try:
      pymongo_utils.UpdateMessage(filter, task, _TASKS_TABLE)
    except LookupError:
      return flask.abort(500)
  else:  # New task.
    pymongo_utils.AddMessage(task, _TASKS_TABLE)
  return json.dumps(merged_doc)


@app.route("/api/task/update", methods=["POST"])
def update_task_all():
  return update_task(["description", "state", "tags"])


@app.route("/api/task/update/description", methods=["POST"])
def update_task_description():
  return update_task(["description"])


@app.route("/api/task/update/state", methods=["POST"])
def update_task_state():
  return update_task(["state"])


@app.route("/api/task/update/tags/add", methods=["POST"])
def update_task_tags_add():
  return update_task(["tags"])


@app.route("/api/task/update/tags/delete", methods=["POST"])
def update_task_tags_delete():
  user = LoadUser()
  if user is None:
    return flask.abort(401)
  task = task_pb2.Task()
  try:
    MergeRequestToMessage(task, ["task_id", "tags"])
    task.user_id = user.user_id
  except:
    return flask.abort(400)
  if not task.HasField("task_id"):
    return flask.abort(400)
  
  tags_to_delete = set(tag.tag_id for tag in task.tags)
  filter = {"task_id": task.task_id, "user_id": task.user_id}
  # Get the current tags that are not marked for deletion.
  current_task = task_pb2.Task()
  pymongo_utils.GetMessage(filter, _TASKS_TABLE, current_task)
  tags = []
  for tag in current_task.tags:
    if tag.tag_id in tags_to_delete:
      continue
    tag_doc = {}
    proto_utils.MergeProtoToDict(tag, tag_doc)
    tags.append(tag_doc)
  # Update the database.
  update = {"tags": tags}
  pymongo_utils.UpdateOne(filter, update, _TASKS_TABLE)
  return "success"


@app.route("/api/task/delete", methods=["POST"])
def delete_task():
  user = LoadUser()
  if user is None:
    return flask.abort(401)
  json_data = flask.request.get_json()
  if json_data is None:
    return flask.abort(400)
  task_id = json_data.get("task_id", None)
  if task_id is None:
    return flask.abort(400)
  try:
    result = pymongo_utils.DeleteOne(
      {"task_id": task_id, "user_id": user.user_id}, _TASKS_TABLE)
    if not result:
      return flask.abort(404)
  except LookupError:
    return flask.abort(500)
  return "success"


if __name__ == '__main__':
  os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
  app.run(host='127.0.0.1', port=10000)
