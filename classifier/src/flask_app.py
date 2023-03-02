from flask import Flask, request, jsonify

from flask_cors import cross_origin
from infrastructure.server import AuthError
from nlp.svm import SVM
from database import ingest
import nltk
import logging

nltk.download('stopwords')
nltk.download('punkt')

# import socket

# socket.getaddrinfo('localhost', 5000)


app = Flask(__name__)
# api = Api(app)
port = 3000

logging.warning("Log app started")


def __init__(self, port):
    self.port = port
    self.app = Flask(__name__)
    self.routes = ''


@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


# This doesn't need authentication
@app.route("/api/public")
@cross_origin(headers=["Content-Type", "Authorization"])
def public():
    response = "Hello from a public endpoint! You don't need to be authenticated to see this."
    return jsonify(message=response)


# This needs authentication
@app.route("/api/private")
@cross_origin(headers=["Content-Type", "Authorization"])
# @requires_auth
def private():
    response = "Hello from a private endpoint! You need to be authenticated to see this."
    return jsonify(message=response)


# Controllers API
# This doesn't need authentication
@app.route("/ping")
@cross_origin(headers=['Content-Type', 'Authorization'])
def ping():
    return "All good. You don't need to be authenticated to call this"


# This does need authentication
@app.route("/secured/ping")
@cross_origin(headers=['Content-Type', 'Authorization'])
# @requires_auth
def secured_ping():
    return "All good. You only get this message if you're authenticated"


@app.route("/api/classify", methods=["POST"])
@cross_origin(headers=["Content-Type", "Authorization"])
# @requires_auth
def classify():
    data = request.get_json()
    print(data)
    text = data['text']
    label, name = SVM.predict(SVM(), text)
    return jsonify(hs_id=label, hs_name=name)


@app.route("/api/store")
@cross_origin(headers=["Content-Type", "Authorization"])
# @requires_auth
def store():
    data = request.get_json()
    print(data)
    dic = data['mongo_dict']
    ingest.ingest(dic)
    return jsonify(status=True)


# def start(self, port):
#    self.app.run(host="0.0.0.0", port=port, debug=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port, debug=True)
