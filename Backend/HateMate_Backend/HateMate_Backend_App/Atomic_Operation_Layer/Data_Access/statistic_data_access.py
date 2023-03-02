from HateMate_Backend_App.models import Classification, ChatGroup, Session, Comment, ChatUser, Server, SourceApp
from django.db.models import QuerySet
from django.contrib.auth.models import Group
import zulu

def get_all_hs_classifications():
    """get all hatespeech classifications

    Returns:
        list: of classifications
    """
    return Classification.objects.filter(id__gte = 1, id__lte = 7)

def get_all_servers_for_auth_user_groups(auth_user_groups):
    """
    get all chat groups

    Args:
        auth_user (_type_): _description_
    """
    return Server.objects.filter(auth_group__in = auth_user_groups)

def get_server_for_chatgroup(server_id: int):
    """
    get server for chatgroup

    Args:
        chatgroup (Chatgroup): The chatgroup under investigation
    
    Returns:
        Server: Server that includes the chatgroup
    """
    return Server.objects.get(pk=server_id)

def get_sourceapp_for_server(server: Server):
    """
    get sourceapp for server

    Args:
        server (Server): The server under investigation
    
    Returns:
        sourceapp: Sourceapp that includes the server
    """
    return SourceApp.objects.get(pk=server.source_app_id)

def get_chat_groups_for_server(server: Server):
    """
    get all ChatGroups belonging to one Server

    Args:
        server (Server): The server under investigation (Discord Server or Telegram equivalent)

    Returns:
        collection: ChatGroups that belong to a server
    """
    return ChatGroup.objects.filter(server=server)

def get_chat_groups_for_servers(servers):
    """
    get all ChatGroups belonging to a list of servers

    Args:
        servers (list): list of servers

    Returns:
        collection: ChatGroups that belong to a server
    """
    return ChatGroup.objects.filter(server__in = servers)

def get_sessions(server: Server):
    """_summary_
    get session object(s) belonging to given server

    Args:
        server (Server): server object

    Returns:
        collection like: Session objects
    """
    return Session.objects.filter(server = server)

def get_session_comments(session: Session, chat_group: ChatGroup):
    """_summary_
    get all comments from a session in a chatgroup

    Args:
        current_session: Session object
        chat_group (ChatGroup): ChatGroup object

    Returns:
        list: Comment objects
    """
    #Comments in Session
    if session.end_time is not None:
        session_comments = Comment.objects.filter(
            timestamp__range = (session.start_time, session.end_time), chat_group = chat_group)
        session_hateful_comments = Comment.objects.filter(
            timestamp__range = (session.start_time, session.end_time),
            chat_group = chat_group, classifier_classification__gte = 1,
            classifier_classification__lte = 7)
    else:
        session_comments = Comment.objects.filter(
            timestamp__range = (session.start_time, zulu.now()), chat_group = chat_group)
        session_hateful_comments = Comment.objects.filter(
            timestamp__range = (session.start_time, zulu.now()),
            chat_group = chat_group, classifier_classification__gte = 1,
            classifier_classification__lte = 7)

    return session_comments, session_hateful_comments


def get_all_classifications() -> QuerySet:
    """
    get all available classification types
    @return: all classifications from database
    """
    return Classification.objects.filter().values()


def get_user_by_id(user_id: int):
    """
    returns the username of a chat user
    @param user_id: user id
    @type user_id: int
    @return:
    """
    return ChatUser.objects.get(id=user_id)

def get_user_name_by_user_id(user_id: int) -> str:
    """
    get user name
    @param user_id: user name
    @return: user name as str
    """
    return ChatUser.objects.get(id=user_id).chat_user_name


def get_classification_text_by_classification_id(classification_id: int):
    """
    get classification text
    @param classification_id: classification id
    @return: classification text as str
    """
    if classification_id is None: return None
    classification_text = Classification.objects.get(id=classification_id).classification
    return classification_text.lower().replace('_', ' ') if classification_text else None
