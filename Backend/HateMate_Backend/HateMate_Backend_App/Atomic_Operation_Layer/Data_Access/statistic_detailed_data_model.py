from dataclasses import dataclass, field
import datetime
from typing import List


@dataclass
class SessionInfo:
    """Class for info about current or latest session."""
    is_current_session: bool = None
    session_start: datetime.datetime = None
    session_end: datetime.datetime = None

@dataclass
class StatisticsAggregationValue:
    value: int

@dataclass
class StatisticsAggregationDateValue:
    value: int
    interval_date: str = None

@dataclass
class StatisticsAggregation:
    sum: int
    max: StatisticsAggregationValue
    min: StatisticsAggregationValue
    average: StatisticsAggregationValue

@dataclass
class HatefulUserDetails:
    general: list = field(default_factory=list) # List of UserHateSpeechInfo
    categories: list = field(default_factory=list) # List of HatefulUserDetailsCategory

@dataclass
class UserHateSpeechInfo:
    username: str
    ranking: int
    total_hateful_comments_sum: int

@dataclass
class HatefulUserDetailsCategory:
    category_name: str
    users: list = field(default_factory=list)# List of UserHateSpeechInfo

@dataclass
class CategoryStatistic:
    category_name: str
    totalSum: int

@dataclass
class IntervalData:
    interval_date: datetime
    total_comments_sum: int
    total_hatespeech_comments_sum: int
    total_manually_flagged_comments_sum: int
    total_automatically_flagged_comments_sum: int
    total_manually_unflagged_comments_sum: int
    total_users_sum: int
    total_hatespeech_comments: List[CategoryStatistic]


# @dataclass
# class TotalHatespeechCommentsPerCategory:
#     categories: list = field(default_factory=list) # List of CategoryStatistics

@dataclass
class Data:
    """Class for dataset."""
    source_app_name: str
    source_app_id: int
    chat_group_name: str
    chat_group_id: int
    server_name: str
    session_info: SessionInfo
    total_comments: StatisticsAggregation
    total_hatespeech_comments: StatisticsAggregation
    total_users: StatisticsAggregation
    total_manually_flagged_comments: StatisticsAggregation
    total_automatically_flagged_comments: StatisticsAggregation
    total_manually_unflagged_comments: StatisticsAggregation
    total_hateful_users: StatisticsAggregation
    most_hateful_users: HatefulUserDetails
    interval_data: list = field(default_factory=list)
    total_hatespeech_comments_per_category: list = field(default_factory=list) # CategoryStatistics

@dataclass() #kw_only=True
class ChatGroupDetails:
    """Summary Class for all statistic related information for the chat group details."""
    is_merged: bool = False
    time_interval: str = "Day"
    time_start: datetime.datetime = None
    time_end: datetime.datetime = None
    chat_groups: list = field(default_factory=list)
    # List of Data objects (on Data object for each chat group)
    data: Data = None
