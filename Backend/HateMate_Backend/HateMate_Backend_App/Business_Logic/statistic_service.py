import dataclasses

import HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.statistic_data_access as da
import HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.statistic_overall_data_model as model

def get_overall_statistic_for_chatgroup(chat_group, server):
    """_summary_
    calculate statistics for given chat group

    Args:
        chat_group_id (int): id of chat group

    Returns:
        json: statistics for single chat group as json
    """
    # Create SessionInfo object
    def get_current_session_info(current_session) -> model.SessionInfo:
        if current_session.end_time is None:
            return model.SessionInfo(True, str(current_session.start_time).replace('+00:00', 'Z'))
        return model.SessionInfo(False, str(current_session.start_time).replace('+00:00', 'Z'),
         str(current_session.end_time).replace('+00:00', 'Z'))

    # Latest session numerical values
    def get_latest_session(current_session, chat_group) -> model.LatestSession:
        current_session_comments, current_session_hateful_comments = da.get_session_comments(
            current_session, chat_group)
        return model.LatestSession(current_session_comments.count(),
         current_session_hateful_comments.count())

    # Get comments sum of all session in server
    def get_all_sessions(all_sessions, chat_group) -> model.AllSessions:
        total_comments_sum: int = 0
        total_hateful_comments_sum: int = 0
        for session in all_sessions:
            comments, hateful_comments = da.get_session_comments(
                session, chat_group)
            total_comments_sum += comments.count()
            total_hateful_comments_sum += hateful_comments.count()
        return model.AllSessions(total_comments_sum, total_hateful_comments_sum)

    # get current session
    def get_current_session(sessions):
        for i, session in enumerate(sessions):
            if session.end_time is None:
                return session
            if i == len(sessions)-1:
                return session

    def server_has_sessions(server):
        return len(da.get_sessions(server)) != 0

    # Create DataClass-Object of chat group statistic
    statistic_model = model.ChatgroupStatistic(
        chat_group.server.source_app.source_app_name,
        chat_group.server.source_app.id,
        chat_group.chat_group_name,
        chat_group.id,
        chat_group.server.server_name,
        model.SessionInfo(),
        model.LatestSession(),
        model.AllSessions(),
    )

    # add session related info if available
    if server_has_sessions(server):
        sessions = da.get_sessions(server)
        current_session = get_current_session(sessions)

        statistic_model.session_info = get_current_session_info(current_session)
        statistic_model.latest_session = get_latest_session(current_session, chat_group)
        statistic_model.all_sessions = get_all_sessions(sessions, chat_group)

    return dataclasses.asdict(statistic_model)

def get_overall_statistic_for_user_group(user_groups):
    """_summary_
    calculate statistics for all servers of a auth user

    Returns:
        json: collection of statistics for all servers of a auth user
    """
    all_servers = da.get_all_servers_for_auth_user_groups(user_groups)
    statistics = []
    for server in all_servers:
        chat_groups = da.get_chat_groups_for_server(server)
        for chat_group in chat_groups:
            statistics.append(get_overall_statistic_for_chatgroup(chat_group, server))

    return statistics


def get_available_classifications() -> list:
    """
    get all available classification types
    @return: classifications as list of dictionaries
    """
    return list(da.get_all_classifications())
