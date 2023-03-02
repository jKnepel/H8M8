from django.contrib.auth.models import User, Group
from rest_framework import serializers

from .Atomic_Operation_Layer.Data_Access import classify_data_access as da
from .models import Classification, SourceApp, ChatGroup, ChatUser, Comment, Session, Server, HandshakeResponse
from rest_framework_dataclasses.serializers import DataclassSerializer

from .Atomic_Operation_Layer.Data_Access.manual_moderation_model import ReportedComment, ManualClassification, \
    ReportedCommentBot
from .models import Classification, SourceApp, ChatGroup, ChatUser, Comment, Session


class ClassificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classification
        fields = '__all__'


class SourceAppSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceApp
        fields = '__all__'


class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
class SourceAppNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceApp
        fields = ['source_app_name']

class AuthGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'

class ReportCommentSerializer(DataclassSerializer):
    class Meta:
        dataclass = ReportedCommentBot

class ServerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    source_app = SourceAppSerializer()
    source_app_server_id = serializers.CharField()

    class Meta:
        model = Server
        fields = [
            'id',
            'source_app',
            'source_app_server_id'
        ]


class ChatGroupSerializer(serializers.ModelSerializer):
    server = ServerSerializer(required=False)

    class Meta:
        model = ChatGroup
        fields = [
            'server',
            'chat_group_name'
        ]
        extra_kwargs = {'server': {'required': False}}


class ChatGroupSerializerWithoutServer(serializers.ModelSerializer):
    class Meta:
        model = ChatGroup
        fields = [
            'chat_group_name'
        ]


class SessionSerializer(serializers.ModelSerializer):
    server = ServerSerializer()

    class Meta:
        model = Session
        fields = [
            'server',
            'start_time',
            'end_time',
        ]


class SessionStartSerializer(serializers.Serializer):
    source_app_server_id = serializers.CharField()
    source_app_name = serializers.CharField()
    server_name = serializers.CharField()

    class Meta:
        fields = [
            'source_app_server_id',
            'source_app_name',
            'server_name'
        ]


class ChatUserSerializer(serializers.ModelSerializer):
    server = ServerSerializer(required=False)

    class Meta:
        model = ChatUser
        fields = [
            'server',
            'chat_user_name'
        ]
        extra_kwargs = {'server': {'required': False}}


class ChatUserSerializerWithoutServer(serializers.ModelSerializer):
    class Meta:
        model = ChatUser
        fields = [
            'chat_user_name'
        ]


class SessionIdSerializer(serializers.Serializer):
    id = serializers.IntegerField()


class ServerIdSerializer(serializers.Serializer):
    id = serializers.IntegerField()

class ReportedCommentSerializer(DataclassSerializer):
    class Meta:
        dataclass = ReportedComment


class ManualClassificationSerializer(DataclassSerializer):
    class Meta:
        dataclass = ManualClassification
class CommentSerializer(serializers.ModelSerializer):
    classifier_classification = ClassificationSerializer(required=False)
    moderator_classification = ClassificationSerializer(required=False)
    chat_user = ChatUserSerializerWithoutServer()
    chat_group = ChatGroupSerializerWithoutServer()
    server = ServerIdSerializer()

    def save(self, validated_data):
        """
        save a comment without classifications.

        Args:
            validated_data (_type_): data from http request

        Returns:
            Comment:  a comment
        """
        server_id = validated_data['server']['id']

        server = da.get_server_by_id(server_id)

        chat_group = da.get_or_create_chat_group(
            chat_group_name=validated_data['chat_group']['chat_group_name'],
            server=server
        )

        chat_user = da.get_or_create_chat_user(
            user_name=validated_data['chat_user']['chat_user_name'],
            server=server)

        comment = da.create_comment(comment_text=validated_data['comment_text'],
                                    chat_user=chat_user,
                                    chat_group=chat_group,
                                    timestamp=validated_data['timestamp'],
                                    source_app_comment_id=validated_data['source_app_comment_id']
                                    )

        return comment

    class Meta:
        model = Comment
        fields = [
            'chat_user',
            'chat_group',
            'classifier_classification',
            'moderator_classification',
            'manually_reported',
            'reviewed_by_moderator',
            'comment_text',
            'timestamp',
            'source_app_comment_id',
            'server'
        ]
        extra_kwargs = {'classifier_classification': {'required': False},
                        'moderator_classification': {'required': False},
                        'manually_reported': {'required': False},
                        'reviewed_by_moderator': {'required': False}
                        }


class CommentIdSerializer(serializers.Serializer):
    source_app_comment_id = serializers.StringRelatedField
    source_app_name = serializers.StringRelatedField


class CommentManualModerationSerializer(serializers.Serializer):
    source_app_comment_id = serializers.StringRelatedField
    source_app_name = serializers.StringRelatedField
    manual_classification_id = serializers.IntegerField


class HandshakeResponseSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    server_id = serializers.IntegerField()
    alive_interval = serializers.FloatField()

    class Meta:
        model = HandshakeResponse
        fields = '__all__'
