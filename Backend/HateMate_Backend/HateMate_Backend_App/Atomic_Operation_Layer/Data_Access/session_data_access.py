from HateMate_Backend_App.models import Server
from HateMate_Backend_App.models import Session
from django.utils.datetime_safe import datetime


def get_open_sessions(server: Server):
    """
    Gets all open session objects from the db linked to a chat group

    @param server: server object
    @type server: Server

    @return: Session Objects of open sessions connected to the chat group
    """
    return Session.objects.filter(server=server, end_time__isnull=True)


def get_session_by_id(session_id: int):
    """
    Gets a session by its id

    @param session_id: session object
    @type session_id: id

    @return: Session Objects matching the given session id
    """
    return Session.objects.get(pk=session_id)


def create_session(start_time: datetime, server: Server):
    """
    Creates a session from raw string data in json form

    @param raw_session_data: session object in json form
    @type raw_session_data: str

    @return: Created session object

    @raise Exception: Exception if something went wrong with the serializer
    """
    return Session.objects.create(start_time=start_time, server=server)


def close_session(session: Session, end_time: datetime):
    """
    Closes a session

    @param session: session object
    @type session: Session

    @param end_time: session object
    @type end_time: Session

    @return: void

    @raise ValueError: Exception if something went wrong with the serializer
    """
    if session.end_time is None:
        session.end_time = end_time
        session.save()
    else:
        raise ValueError("Session already closed")
