from dataclasses import dataclass
import datetime

@dataclass
class SessionInfo:
    """Class for info about current or latest session."""
    is_online: bool = None
    session_start: datetime.datetime = None
    session_end: datetime.datetime = None

@dataclass
class LatestSession:
    """Class for comment statistics of latest session."""
    total_comments_sum: int = 0
    total_hateful_comments_sum: int = 0

@dataclass
class AllSessions:
    """Class for comment statistics of all sessions."""
    total_comments_sum: int = 0
    total_hateful_comments_sum: int = 0

@dataclass
class ChatgroupStatistic:
    """Summary class for all statistic related information of a class."""
    source_app_name: str
    source_app_id: int
    chat_group_name: str
    chat_group_id: int
    server_name: str
    session_info: SessionInfo = None
    latest_session: LatestSession = None
    all_sessions: AllSessions = None
