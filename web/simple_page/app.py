import flask
from flask import json
from utils import simple_pymongo_counter

app = flask.Flask(__name__)

# Disable logging
# import logging
# log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)

@app.route('/', methods=['GET'])
def home():
	return flask.send_from_directory('resources', 'index.html')
	
@app.route('/js/<path:file>', methods=['GET'])
def send_js(file):
    return flask.send_from_directory('resources', file)
    
@app.route('/api/count', methods=['GET', 'POST'])
def get_count():
    counter = simple_pymongo_counter.SimplePymongoCounter()

    if flask.request.method == 'POST':
        count = counter.Increment();
    else:
        count = counter.GetCount();
    return json.dumps({'count': count})
    
@app.route('/api/reset', methods=['POST'])
def reset_count():
    count = simple_pymongo_counter.SimplePymongoCounter().Reset()
    return json.dumps({'count': count})

if __name__ == '__main__':
    # app.run(host='127.0.0.1', port=8080)
    app.run(host='0.0.0.0', port=8080)
