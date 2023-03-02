"""
This module contains the business logic for reacting on detected hate speech
"""
import logging

from HateMate_Backend_App.Atomic_Operation_Layer.bot.request import delete_comment
from HateMate_Backend_App.serializers import ClassificationSerializer, Comment


def handle_classification(classification: ClassificationSerializer, comment: Comment):
    """
    Sends a comment-id to the hate speech bot if hate speech was detected
    @param classification: serialized response from hate speech classifier
    @param comment: serialized comment which should be deleted
    """
    if int(classification.data.get('id')) > 0:
        logging.debug('trigger bot to delete comment')
        delete_comment(comment.source_app_comment_id)
