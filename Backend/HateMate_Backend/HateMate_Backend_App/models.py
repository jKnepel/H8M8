from django.contrib.auth.models import Group
from django.db import models


class Classification(models.Model):
    """
        Representing a text classification type for hate speech
    """
    classification = models.CharField(max_length=100)

    def __str__(self):
        return self.classification


class SourceApp(models.Model):
    """
        Representing a source app as plattform origin
    """
    source_app_name = models.CharField(max_length=100)

    def __str__(self):
        return self.source_app_name


class Server(models.Model):
    """Representing a Server on the source app"""
    server_name = models.CharField(max_length=100, default=None, blank=True, null=True)
    source_app = models.ForeignKey(SourceApp, null=True, on_delete=models.SET_NULL)
    auth_group = models.ForeignKey(Group, null=True, on_delete=models.SET_NULL)
    source_app_server_id = models.CharField(max_length=100)

    class Meta:
        unique_together = ('source_app', 'source_app_server_id',)

    def __str__(self):
        return self.server_name


class ChatGroup(models.Model):
    """
        Representing a chat group within a source app
    """
    server = models.ForeignKey(Server, null=True, on_delete=models.SET_NULL)
    chat_group_name = models.CharField(max_length=100)

    def __str__(self):
        return self.chat_group_name


class Session(models.Model):
    """Representing up times of bots."""
    server = models.ForeignKey(Server, null=True, on_delete=models.SET_NULL)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(default=None, null=True, blank=True)


class ChatUser(models.Model):
    """
        Representing a user within a chat group
    """
    server = models.ForeignKey(Server, null=True, on_delete=models.SET_NULL)
    chat_user_name = models.CharField(max_length=100)

    def __str__(self):
        return self.chat_user_name


class Comment(models.Model):
    """
        Representing a chat comment within a chat group made by a user
    """
    classifier_classification = models.ForeignKey(Classification, related_name='moderator_classification', null=True,
                                                  on_delete=models.SET_NULL)
    moderator_classification = models.ForeignKey(Classification, related_name='classifier_classification', null=True,
                                                 on_delete=models.SET_NULL)
    chat_user = models.ForeignKey(ChatUser, null=True, on_delete=models.SET_NULL)
    chat_group = models.ForeignKey(ChatGroup, null=True, on_delete=models.SET_NULL)
    comment_text = models.TextField()
    manually_reported = models.BooleanField(default=False)
    reviewed_by_moderator = models.BooleanField(default=False)
    timestamp = models.DateTimeField(default=None, null=True, blank=True)
    source_app_comment_id = models.CharField(max_length=100, default='missing')

    def __str__(self):
        return self.comment_text


class HandshakeResponse(models.Model):
    session_id: int = None
    server_id: int = None
    alive_interval: float = None

    def __init__(self, session_id, server_id, alive_interval, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.session_id = session_id
        self.server_id = server_id
        self.alive_interval = alive_interval

    class Meta:
        managed = False
