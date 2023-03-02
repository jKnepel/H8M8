from dataclasses import dataclass
import datetime


@dataclass
class ReportedComment:
    moderator_classification_id: int
    user: str
    comment_text: str
    manually_reported: bool
    reviewed_by_moderator: bool
    timestamp: datetime.datetime
    source_app_comment_id: str
    source_app_name: str
    classifier_classification_id: int
    classifier_classification_text: str


@dataclass
class ReportedCommentBot:
    source_app_comment_id: str
    source_app_name: str


@dataclass
class ManualClassification:
    source_app_name: str
    source_app_comment_id: str
    manual_classification_id: int
