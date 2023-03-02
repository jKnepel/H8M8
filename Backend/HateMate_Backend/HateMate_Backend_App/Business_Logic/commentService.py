import dataclasses
import json

from HateMate_Backend_App.Atomic_Operation_Layer.Classifier.request import classifyHateSpeech
import HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.classify_data_access as da
from HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.manual_moderation_model import ReportedComment
from HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.statistic_data_access import \
    get_user_name_by_user_id
from HateMate_Backend_App.models import Comment, Classification
from HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.statistic_data_access import get_classification_text_by_classification_id


def get_comment_from_request() -> Comment:
    pass


def get_automatic_category_for_comment(comment: Comment) -> Classification:
    """
        Sends a comment to the hate speech classifier and appends its result

        @param comment: comment to evaluate
        @type comment: Comment
        @return: comment
    """
    classification_json = classifyHateSpeech(comment.comment_text)
    classification = da.get_or_create_classification(id=classification_json['hs_id'],
                                                     classification=classification_json['hs_name'])
    comment = da.append_classification_to_comment(
        comment, classifier_classification=classification)
    return comment.classifier_classification


def report_comments_as_hate_speech(source_app_comment_id: str, source_app_name: str = None) -> None:
    """
        Flags all comments as manually reported by a given source app comment id

        @param source_app_comment_id: id of the comments to flag
        @type source_app_comment_id: str
        @param source_app_name: source app name as additional reference
        @type: SourceApp
    """
    comments = da.get_comments_by_source_app_comment_id(source_app_comment_id)
    for comment in comments:
        if source_app_name is None:
            comment.manually_reported = True
            comment.save()
        elif comment.chat_group.server.source_app.source_app_name == source_app_name.lower():
            comment.manually_reported = True
            comment.save()


def get_all_to_manually_classify() -> list:
    """
        Returns all comments which need to be manually classified
    """
    reported_comments = da.get_comments_where_manually_reported_and_not_manually_classified()
    comments = []
    comment: Comment

    for comment in reported_comments:
        has_classification = False
        classification = {}
        if comment.classifier_classification_id is not None:
          classification['text'] = get_classification_text_by_classification_id(comment.classifier_classification_id)
          classification['id'] = comment.classifier_classification_id
          has_classification = True

        reported_comment = ReportedComment(
            comment.moderator_classification,
            comment.chat_user.chat_user_name,
            comment.comment_text,
            comment.manually_reported,
            comment.reviewed_by_moderator,
            comment.timestamp,
            comment.source_app_comment_id,
            comment.chat_group.server.source_app.source_app_name,
            classification['id'] if has_classification else None,
            classification['text'] if has_classification else None
        )
        comments.append(dataclasses.asdict(reported_comment))
    return comments


def add_manual_classification_to_existing_comment(source_app_name: str, source_app_comment_id: str,
                                                  moderator_classification: int):
    """
        Add manual classification to comment
        @param source_app_name: source app name of comment e.g. 'discord'
        @param source_app_comment_id:
        @param moderator_classification:
    """
    comments = da.get_comments_by_source_app_comment_id(source_app_comment_id)
    comment_: Comment
    for comment_ in comments:
        if comment_.chat_group.server.source_app.source_app_name != source_app_name:
            continue
        comment_.reviewed_by_moderator = True
        da.append_classification_to_comment(
            comment_, moderator=da.get_classification_by_id(moderator_classification))
