from HateMate_Backend_App.Business_Logic.bot_service import handle_classification
"""
This module provides REST endpoints for the hatemate bot
"""

import environ

from HateMate_Backend_App.Business_Logic.commentService import get_automatic_category_for_comment, \
    report_comments_as_hate_speech
from HateMate_Backend_App.Business_Logic.commentService import get_automatic_category_for_comment
from HateMate_Backend_App.Business_Logic.sessionService import create_new_session, refresh_session, close_open_session
from HateMate_Backend_App.serializers import ClassificationSerializer, CommentSerializer, SessionIdSerializer, \
    SessionSerializer, ReportCommentSerializer
from HateMate_Backend_App.models import Session
from HateMate_Backend_App.serializers import ClassificationSerializer
from HateMate_Backend_App.serializers import CommentSerializer
from HateMate_Backend_App.serializers import SessionIdSerializer
from HateMate_Backend_App.serializers import SessionSerializer, SessionStartSerializer, HandshakeResponseSerializer
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from requests import RequestException, Timeout, HTTPError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from HateMate_Backend_App.models import Session

env = environ.Env()
# optional env for testing
DISABLE_BOT_RESPONSE = env("DISABLE_BOT_RESPONSE", default=False)


@swagger_auto_schema(method='post', request_body=CommentSerializer,
                     responses={201: "id: id, classification: classification"},
                     operation_description="This Endpoint accepts a Comment, it will store it for future statistics "
                                           "and it will return a categorization of the comment",
                     operation_summary="Endpoint for receiving and evaluating comments for being hate speech")
@api_view(['POST'])
def classify(request):
    """
    REST endpoint for receiving and evaluating comments for being hate speech

    @param request: http request
    @type request: any
    @return: evaluation results
    """
    comment_serializer = CommentSerializer(data=request.data)
    if comment_serializer.is_valid():
        comment = comment_serializer.save(comment_serializer.validated_data)
        try:
            category = get_automatic_category_for_comment(comment)
        except (HTTPError, ConnectionError, Timeout, RequestException) as error:
            comment.delete()
            return Response(str(error), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        classification_serializer = ClassificationSerializer(category)
        if not DISABLE_BOT_RESPONSE:
            handle_classification(classification_serializer, comment)

        return Response(classification_serializer.data, status=status.HTTP_201_CREATED)
    return Response(comment_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='put', request_body=SessionStartSerializer,
                     responses={status.HTTP_201_CREATED: HandshakeResponseSerializer})
@api_view(['PUT'])
def session_create(request):
    """
    REST endpoint to create a new bot session

    @param request: http request
    @type request: any
    @return: session object as http response
    """
    session_start_serializer = SessionStartSerializer(data=request.data)
    if session_start_serializer.is_valid():
        try:
            handshake_response = create_new_session(session_start_serializer.validated_data)
            return Response(HandshakeResponseSerializer(handshake_response).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            raise e
            return Response(f"Exception occurred: {e}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(session_start_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='post', request_body=SessionIdSerializer,
                     responses={status.HTTP_200_OK: openapi.Response(description="Refresh successful"),
                                status.HTTP_404_NOT_FOUND: openapi.Response(
                                    description="Can not find session with id")},
                     operation_description="This Endpoint refreshes a bot session. This Endpoint has to be called once "
                                           "in the time-scope that is defined in the env var. "
                                           "Otherwise the session will be closed",
                     operation_summary="REST endpoint to refresh a bot session")
@api_view(['POST'])
def session_refresh(request):
    """
    REST endpoint to refresh a bot session

    @param request: http request
    @type request: any
    @return: session object as http response
    """
    session_id_serializer = SessionIdSerializer(data=request.data)
    if session_id_serializer.is_valid():
        try:
            session_id = session_id_serializer.validated_data["id"]
            refresh_session(session_id)
            return Response(status=status.HTTP_200_OK)
        except KeyError as e:
            return Response(f"Error: {e}", status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(f"Exception occurred: {e}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(session_id_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='post', request_body=SessionIdSerializer,
                     responses={status.HTTP_200_OK: openapi.Response(description="Session Closed"),
                                status.HTTP_404_NOT_FOUND: openapi.Response(
                                    description="Can not find session with id"),
                                status.HTTP_409_CONFLICT: openapi.Response(
                                    description="Session already closed")},
                     operation_description="This Endpoint closes an open session",
                     operation_summary="REST endpoint to close a bot session")
@api_view(['POST'])
def session_close(request):
    """
    REST endpoint to close a bot session
    @param request: http request
    @type request: any
    @return: session object as http response
    """
    session_id_serializer = SessionIdSerializer(data=request.data)
    if session_id_serializer.is_valid():
        try:
            session_id = session_id_serializer.validated_data["id"]
            close_open_session(session_id)
            return Response(status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(f"Error: {e}", status=status.HTTP_409_CONFLICT)
        except Session.DoesNotExist as e:
            return Response(f"Error: {e}", status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(f"Exception occurred: {e}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(session_id_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='post', request_body=ReportCommentSerializer,
                     responses={204: ""},
                     operation_description="This Endpoint accepts a source app comment id with a provided source app",
                     operation_summary="Endpoint for reporting comments for being hate speech")
@api_view(['POST'])
def report_comment(request):
    """
    REST endpoint to report a comment
    @param request: http request
    @return: http response (code 204)
    """
    comment_serializer = ReportCommentSerializer(data=request.data)
    if comment_serializer.is_valid():
        source_app_id = comment_serializer.validated_data.source_app_name
        source_app_comment_id = comment_serializer.validated_data.source_app_comment_id
        report_comments_as_hate_speech(source_app_comment_id, source_app_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(comment_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
