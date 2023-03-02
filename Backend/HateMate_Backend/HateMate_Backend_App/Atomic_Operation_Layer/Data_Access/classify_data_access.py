from django.db.models import QuerySet

import HateMate_Backend_App.models as models
import zulu
from django.contrib.auth.models import User, Group


def get_or_create_source_app(source_app_name: str) -> models.SourceApp:
    """
        Fetches a source app entity from the database by its name.
        If the entity does not exist already it will be created.

        @param source_app_name: case insensitive name of the source app
        @type source_app_name: str
        @return: source app
    """
    source_app = None
    try:
        source_app = models.SourceApp.objects.get(source_app_name=source_app_name.lower())
    except models.SourceApp.DoesNotExist:
        source_app = models.SourceApp.objects.create(source_app_name=source_app_name.lower())

    return source_app


def get_auth_group(server_id: int) -> User:
    """Return an auth from the auth module of django"""
    auth_group = None
    try:
        auth_group = Group.objects.get(server__id=server_id)
    except User.DoesNotExist:
        raise ReferenceError("Can not find auth user")

    return auth_group


def get_server_by_id(server_id: int) -> models.Server:
    """
        Fetches a server from the db by the server id
        If not found it will throw a refrence error
    """
    server = None
    try:
        server = models.Server.objects.get(id=server_id)
        return server
    except User.DoesNotExist:
        raise ReferenceError("Can not find server with given id")


def get_or_create_server(server_name: str, source_app_server_id: str, source_app: models.SourceApp) -> models.Server:
    """
        Fetches a server from the db, if a server with the given information exists.
        Also updates the server name if the name was changed
        Throws ReferenceError if no entry was found
    """
    server = None
    try:
        server = models.Server.objects.get(source_app_server_id=source_app_server_id, source_app=source_app)
        return server
    except models.Server.DoesNotExist:
        user_group, created = Group.objects.get_or_create(name=f"{server_name}-{source_app_server_id}")
        return models.Server.objects.create(server_name=server_name, source_app_server_id=source_app_server_id,
                                            source_app=source_app, auth_group=user_group)


def change_server_name(server: models.Server, server_name: str, source_app_server_id: str):
    """
        Changes the server name in the db
        @param server: referencing server
        @type server: Server
        @param server_name: new server name
        @type server_name: str
        @param source_app_server_id: source app id of server
        @type source_app_server_id: str
        @return: changed server object
    """
    server.server_name = server_name
    server.auth_group.name = f"{server_name}-{source_app_server_id}"
    server.auth_group.save()
    server.save()
    return server


def get_or_create_chat_group(chat_group_name: str, server: models.Server) -> models.ChatGroup:
    """
        Fetches a chat group from the database by its name and source app reference.
        If the entity does not exist already it will be created.

        @param server: referencing server
        @type server: Server
        @param chat_group_name: case insensitive name of the chat group
        @type chat_group_name: str
        @return: chat group
    """
    chat_group = None
    try:
        chat_group = models.ChatGroup.objects.get(chat_group_name=chat_group_name.lower(), server=server)
    except models.ChatGroup.DoesNotExist:
        chat_group = models.ChatGroup.objects.create(chat_group_name=chat_group_name.lower(), server=server)
    return chat_group


def get_or_create_session(chat_group: models.ChatGroup, start_time: str) -> models.Session:
    """
        Fetches an application session by a chatgroup and its start time.
        If the entity does not exist already it will be created.

        @param chat_group: referencing chat group
        @type chat_group: ChatGroup
        @param start_time: start time as string
        @type start_time: str
        @return: application session
    """
    session = None
    try:
        session = models.Session.objects.get(start_time=start_time, chat_group=chat_group)
    except models.Session.DoesNotExist:
        session = models.Session.objects.create(start_time=start_time, chat_group=chat_group)

    return session


def get_or_create_chat_user(user_name: str, server: models.Server) -> models.ChatUser:
    """
        Fetches a user from the database by its name and chat group reference.
        If the entity does not exist already it will be created.

        @param chat_group: referencing chat group
        @type chat_group: ChatGroup
        @param user_name: case insensitive name of the user
        @type user_name: str
        @return: user
    """
    chat_user = None
    try:
        chat_user = models.ChatUser.objects.get(chat_user_name=user_name, server=server)
    except models.ChatUser.DoesNotExist:
        chat_user = models.ChatUser.objects.create(chat_user_name=user_name, server=server)

    return chat_user


def get_or_create_classification(id: int, classification: str) -> models.Classification:
    """
        Fetches a classification the database by its name.
        If the entity does not exist already it will be created.

        @param id: unique id
        @type id: int
        @param classification: case insensitive classification description
        @type classification: str
        @return: classification
    """
    category = None
    try:
        category = models.Classification.objects.get(id=id, classification=classification)
    except models.Classification.DoesNotExist:
        category = models.Classification.objects.create(id=id, classification=classification)

    return category


def create_comment(comment_text: str, chat_user: models.ChatUser, chat_group: models.ChatGroup, timestamp: str,
                   source_app_comment_id: str, manually_reported: bool = False, reviewed_by_moderator: bool = False,
                   category: models.Classification = None) -> models.Comment:
    """
        Creates a new comment and stores it in the database.

        @param comment_text: content of the comment
        @type comment_text: str
        @param chat_user: chat_user from whom this comment originates
        @type chat_user: ChatUser
        @param chat_group: chat_group where the comments originates
        @type chat_group: ChatGroup
        @param timestamp: timestamp of the message as string
        @type timestamp: str
        @param source_app_comment_id: original comment id provided by the origin source application
        @type source_app_comment_id: str
        @param manually_reported: whether or not this comment has been manually reported
        @type manually_reported: bool
        @param reviewed_by_moderator: whether or not this comment has been reviewed
        @type reviewed_by_moderator: bool
        @param classifier_classification: automatic classification of comment
        @type classifier_classification: Classification
        @return: comment
    """
    zulu_ts = zulu.parse(timestamp)
    comment = models.Comment.objects.create(comment_text=comment_text, chat_user=chat_user, chat_group=chat_group,
                                            manually_reported=manually_reported,
                                            reviewed_by_moderator=reviewed_by_moderator,
                                            classifier_classification=category, timestamp=zulu_ts,
                                            source_app_comment_id=source_app_comment_id)
    return comment


def append_classification_to_comment(comment: models.Comment, classifier_classification: models.Classification = None,
                                     moderator: models.Classification = None) -> models.Comment:
    """
        Appends a classification to an existing comment.

        @param comment: comment to append to
        @type comment: Comment
        @param classifier_classification: classification from classifier
        @type classifier_classification: Classification
        @param moderator: classification from moderator
        @type moderator: Classification
        @return: comment
    """
    if classifier_classification is not None:
        comment.classifier_classification = classifier_classification
    if moderator is not None:
        comment.moderator_classification = moderator
    comment.save()
    return comment


def get_comments_by_source_app_comment_id(source_app_comment_id: str) -> list:
    """
        Returns all comments with a given comment id

        @param source_app_comment_id: id
        @type source_app_comment_id: str
    """
    return models.Comment.objects.filter(source_app_comment_id=source_app_comment_id)


def get_comments_where_manually_reported_and_not_manually_classified() -> QuerySet:
    """
        Returns all comments which have been manually reported but have yet to receive a classification by a moderator
    """
    return models.Comment.objects.filter(manually_reported=True, moderator_classification=None)


def get_classification_by_id(classification_id: int):
    """
    returns classification text of
    @param classification_id:
    @return:
    """
    return models.Classification.objects.get(id=classification_id)
