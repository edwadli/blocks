import flask

app = flask.Flask(__name__)

# Disable logging
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

@app.route('/', methods=['GET'])
def home():
    return "Website under construction..."
	
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)
