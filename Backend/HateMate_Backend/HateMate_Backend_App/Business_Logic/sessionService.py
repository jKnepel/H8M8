import threading

import environ
from HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.classify_data_access import \
    get_or_create_source_app, get_or_create_server, change_server_name
from HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.session_data_access import \
    get_open_sessions, close_session, get_session_by_id, create_session
from HateMate_Backend_App.models import Session, HandshakeResponse
from django.utils import timezone

env = environ.Env()
SESSION_ALIVE_INTERVAL = env("SESSION_ALIVE_INTERVAL")

open_session_timers = {}


def create_new_session(validated_session_data):
    """
    Creates a new session for a bot. Closes all open sessions if any exist.
    Starts a timer to close session if not any refresh occurs within the set interval

    @param validated_session_data: session start object
    @type validated_session_data: OrderedDict
    @return: handshake object containing various information for the bot
    """

    # Get server
    source_app = get_or_create_source_app(validated_session_data.get('source_app_name'))
    server_name = validated_session_data.get('server_name')
    server_source_app_id = validated_session_data.get('source_app_server_id')
    server = get_or_create_server(validated_session_data.get('server_name'),
                                  validated_session_data.get('source_app_server_id'),
                                  source_app)
    # check if server name changed
    if server.server_name != server_name:
        server = change_server_name(server, server_name, server_source_app_id)

    # create session
    open_sessions = get_open_sessions(server.pk)
    for openSession in open_sessions:
        close_session(openSession, timezone.now())
    session = create_session(timezone.now(), server)
    create_session_alive_timer(session)

    # create handshake object as return object
    return HandshakeResponse(session.pk, server.pk, SESSION_ALIVE_INTERVAL)


def create_session_alive_timer(session: Session):
    """
    creates a timer that closes a session after the defined interval

    @param session: session object of the object that should be closed
    @type session: Session
    @return: void
    """
    open_session_timers[session.pk] = threading.Timer(float(SESSION_ALIVE_INTERVAL), on_stale_session, [session])
    open_session_timers[session.pk].start()


def on_stale_session(session: Session):
    """
    Closes a session and deletes the corresponding timer from the dict

    @param session: session object
    @type session: Session

    @return: void
    """
    close_session(session, timezone.now())
    del open_session_timers[session.pk]


def refresh_session(session_id: int):
    """
    Refreshes a session and its corresponding timer

    @param session_id: id of the session
    @type session_id: int

    @return: void
    @raise KeyError: if requested ID is not found
    """
    if session_id in open_session_timers:
        session_timer = open_session_timers[session_id]
        session_timer.cancel()
        del open_session_timers[session_id]
        create_session_alive_timer(get_session_by_id(session_id))
    else:
        raise KeyError("Can not find session with the requested ID")


def close_open_session(session_id: int):
    """
    Closes a session

    @param session_id: id of session
    @type session_id: int

    @return: void
    """
    session = get_session_by_id(session_id)
    close_session(session, timezone.now())
