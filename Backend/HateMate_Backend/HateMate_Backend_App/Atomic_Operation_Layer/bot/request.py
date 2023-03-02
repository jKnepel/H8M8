"""
This module implements requests to communicate with the REST endpoints provided by the bot
"""

import requests
import environ

env = environ.Env()
BOT_URL = env("BOT_DELETE_MESSAGE_URL")


def delete_comment(source_app_comment_id: str) -> None:
    """
    Sends a post request to the hate speech bot to delete a message which was classified as hate speech
    """
    response = requests.post(url=BOT_URL, json={"comment_id": source_app_comment_id}, timeout=10)

    if response.status_code != requests.codes.ok:
        response.raise_for_status()
