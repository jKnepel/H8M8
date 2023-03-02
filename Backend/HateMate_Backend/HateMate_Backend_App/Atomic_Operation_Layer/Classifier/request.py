import requests
import environ


env = environ.Env()
CLASSIFIER_URL = env("CLASSIFIER_URL")

def classifyHateSpeech(data: str):
    """
        Sends a request to the hate speech classifier

        @param data: Text which should be evaluated
        @type data: str
        @return: Result of the classification as json
    """
    response = requests.post(url=CLASSIFIER_URL, json={"text": data}, timeout=3)
    if response.status_code == 200:
        print(response.json())
        return response.json()
    response.raise_for_status()

