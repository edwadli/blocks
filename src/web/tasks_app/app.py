import flask
from flask import json
from flask_dance.contrib import google
import logging
from oauthlib import oauth2
import os
from werkzeug import security

from env import pymongo_env
from env import secret_keeper

from src.utils import single_pymongo_document
from src.utils import proto_utils
from src.web.tasks_app import task_pb2
from src.web.tasks_app import user_pb2

_USER_TABLE = pymongo_env.PUBLIC_DB['task_app_users']
_TASKS_TABLE = pymongo_env.PUBLIC_DB['task_app_tasks']

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

def DocumentToProto(document, proto_constructor):
  """Returns the proto created from 'document'"""
  if document is None:
    return None
  del document['_id']
  message = proto_constructor()
  proto_utils.MergeDictToProto(document, message)
  return message

def LoadUser():
  """Returns the user from the request, or None if not logged in."""
  try:
    assert google.google.authorized
    resp = google.google.get("/oauth2/v2/userinfo")
    assert resp.ok, resp.text
    google_info = resp.json()
    user_id = google_info.get("id", None)
    assert user_id
  except (oauth2.TokenExpiredError, AssertionError):
    return
  # Load (or create) the User from Database.
  user_doc = single_pymongo_document.SinglePymongoDocument(
    user_id, document={
      "_id": user_id,
      "user_id": user_id,
      "email": google_info.get("email", ""),
      "name": google_info.get("name", "")},
    collection=_USER_TABLE).GetDocument()
  return DocumentToProto(user_doc, user_pb2.User)

@app.route("/")
def index():
  return flask.send_from_directory("resources", "index.html")

@app.route("/js/<path:file>", methods=["GET"])
def send_js(file):
  if file.split(".")[-1] != "js":
    return ""
  return flask.send_from_directory("resources", file)

@app.route("/jsx/<path:file>", methods=["GET"])
def send_jsx(file):
  if file.split(".")[-1] != "jsx":
    return ""
  return flask.send_from_directory("resources", file)

@app.route("/login/google")
def login_google():
  return flask.redirect(flask.url_for("google.login"))

# APIs

@app.route("/api/profile/read", methods=["POST"])
def read_profile():
  user = LoadUser()
  result = {}
  proto_utils.MergeProtoToDict(user, result)
  return json.dumps(result)

@app.route("/api/profile/update", methods=["POST"])
def update_profile():
  user = LoadUser()
  if user is None:
    return json.dump({})  # TODO: return an error
  # Read request data to update 'name' or 'email' fields.
  request_json = flask.request.get_json()
  update_data = {k: request_json.get(k) for k in ["name", "email"]
                 if k in request_json}
  single_pymongo_document.SinglePymongoDocument(
    user.user_id, collection=_USER_TABLE).UpdateFields(update_data)
  return json.dumps({})  # TODO: return a success

@app.route("/api/profile/logout", methods=["POST"])
def logout_profile():
  token = google_blueprint.token["access_token"]
  resp = google.google.post(
    "https://accounts.google.com/o/oauth2/revoke",
    params={"token": token},
    headers={"Content-Type": "application/x-www-form-urlencoded"})
  return json.dumps({})

@app.route("/api/task/read", methods=["POST"])
def get_tasks():
  user = LoadUser()
  if user is None:
    return json.dumps({})  # TODO: return an error
  if flask.request.method == 'GET':
    results = _TASKS_TABLE.find({"user_id": user.user_id})
    results = [dict(r) for r in results]
    for result in results:
      del result["user_id"]
      del result["_id"]
    return json.dumps({"results": results})
  else:  # request is POST
    # TODO read input data. If it has an ID - update existing. Else add new.
    _TASKS_TABLE.insert_one({
     "description": "new task",
     "user_id": user.user_id,
    })
    return json.dumps({"status": "OK"})
  
@app.route("/api/task/add", methods=["POST"])
def add_task():
  user = LoadUser()
  if user is None:
    return json.dumps({})  # TODO: return an error
  # TODO read input data.
  _TASKS_TABLE.insert_one({
   "description": "new task",
   "user_id": user.user_id,
  })
  return json.dumps({"status": "OK"})

@app.route("/api/task/update", methods=["POST"])
def update_task():
  user = LoadUser()
  if user is None:
    return json.dumps({})  # TODO: return an error
  # TODO: update existing task
  return json.dumps({"status": "OK"})

@app.route("/api/task/delete", methods=["POST"])
def delete_task():
  # TODO: delete task
  return json.dumps({})


if __name__ == '__main__':
  os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
  app.run(host='127.0.0.1', port=10000)
