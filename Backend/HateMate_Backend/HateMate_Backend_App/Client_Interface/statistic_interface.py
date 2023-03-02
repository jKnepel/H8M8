# from requests import exceptions
import HateMate_Backend_App.Business_Logic.statistic_service as service
import HateMate_Backend_App.Business_Logic.statistic_details_service as std_service

# from requests import exceptions
"""
This module provides REST endpoints for the hatemate frontend
"""
from HateMate_Backend_App.Business_Logic.statistic_service import get_available_classifications
from HateMate_Backend_App.Business_Logic.commentService import add_manual_classification_to_existing_comment, \
    get_all_to_manually_classify
from HateMate_Backend_App.serializers import ClassificationSerializer, ManualClassificationSerializer, \
    ReportedCommentSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import status

chatgroups_statistics_schema_response = {
    status.HTTP_200_OK: openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'sourceAppName': openapi.Schema(type=openapi.TYPE_STRING),
            'sourceAppID': openapi.Schema(type=openapi.TYPE_INTEGER),
            'chatGroupName': openapi.Schema(type=openapi.TYPE_STRING),
            'chatGroupID': openapi.Schema(type=openapi.TYPE_INTEGER),
            'serverName': openapi.Schema(type=openapi.TYPE_STRING),
            'sessionInfo': openapi.Schema(type=openapi.TYPE_OBJECT,
                                          properties={
                                              'isOnline': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                              'sessionStart': openapi.Schema(type=openapi.TYPE_STRING),
                                              'sessionEnd': openapi.Schema(type=openapi.TYPE_STRING),
                                          }),
            'latestSession': openapi.Schema(type=openapi.TYPE_OBJECT,
                                            properties={
                                                'totalCommentsSum': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                'totalHatefulCommentsSum': openapi.Schema(type=openapi.TYPE_INTEGER)
                                            }),
            'allSession': openapi.Schema(type=openapi.TYPE_OBJECT,
                                         properties={
                                             'totalCommentsSum': openapi.Schema(type=openapi.TYPE_INTEGER),
                                             'totalHatefulCommentsSum': openapi.Schema(type=openapi.TYPE_INTEGER)
                                         })
        }
    ),
}


@swagger_auto_schema(method='get',
                     responses=chatgroups_statistics_schema_response,
                     operation_description="This Endpoint gets the chat group overall statistics for a user",
                     operation_summary="REST Endpoint to get chat group overall statistic")
@api_view(['GET'])
def chatgroups_statistic(request):
    '''Provides the overall statistics of all chat groups for the authenticated user'''
    return Response(service.get_overall_statistic_for_user_group(request.user.groups.all()))


chatgroups_details_statistics_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'isMerged': openapi.Schema(type=openapi.TYPE_BOOLEAN),
        'timeInterval': openapi.Schema(type=openapi.TYPE_STRING),
        'timeStart': openapi.Schema(type=openapi.TYPE_STRING),
        'timeEnd': openapi.Schema(type=openapi.TYPE_STRING)
    }
)


chatgroups_details_statistics_schema_response = {
    status.HTTP_200_OK: openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'isMerged': openapi.Schema(type=openapi.TYPE_BOOLEAN),
            'timeInterval': openapi.Schema(type=openapi.TYPE_STRING),
            'timeStart': openapi.Schema(type=openapi.TYPE_STRING),
            'timeEnd': openapi.Schema(type=openapi.TYPE_STRING),
            'data': openapi.Schema(type=openapi.TYPE_OBJECT,
                                   properties={
                                       'sessionInfo': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                     properties={
                                                                         'isCurrentSession': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                                                         'sessionStart': openapi.Schema(type=openapi.TYPE_STRING),
                                                                         'sessionEnd': openapi.Schema(type=openapi.TYPE_STRING),
                                                                     }),
                                       'totalComments': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                       properties={
                                                                           'sum': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                                                           'max': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                 properties={
                                                                                                     'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                     'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                 }),
                                                                           'min': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                 properties={
                                                                                                     'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                     'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                 }),
                                                                           'average': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                     properties={
                                                                                                         'value': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                                                                     })
                                                                       }),
                                       'totalHatespeechComments': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                 properties={
                                                                                     'sum': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                                                                     'max': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                           properties={
                                                                                                               'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                               'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                           }),
                                                                                     'min': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                           properties={
                                                                                                               'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                               'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                           }),
                                                                                     'average': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                               properties={
                                                                                                                   'value': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                                                                               })
                                                                                 }),
                                       'totalHatespeechCommentsPerCategory': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                            properties={
                                                                                                'sum': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                                                                                'max': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                      properties={
                                                                                                                          'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                                          'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                                      }),
                                                                                                'min': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                      properties={
                                                                                                                          'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                                          'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                                      }),
                                                                                                'average': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                          properties={
                                                                                                                              'value': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                                                                                          })
                                                                                            }),
                                       'totalUsers': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                    properties={
                                                                        'sum': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                                                        'max': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                              properties={
                                                                                                  'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                  'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                              }),
                                                                        'min': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                              properties={
                                                                                                  'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                  'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                              }),
                                                                        'average': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                  properties={
                                                                                                      'value': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                                                                  })
                                                                    }),
                                       'totalManuallyFlaggedComments': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                      properties={
                                                                                          'sum': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                                                                          'max': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                properties={
                                                                                                                    'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                                    'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                                }),
                                                                                          'min': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                properties={
                                                                                                                    'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                                    'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                                }),
                                                                                          'average': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                    properties={
                                                                                                                        'value': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                                                                                    })
                                                                                      }),
                                       'totalAutomaticallyFlaggedComments': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                           properties={
                                                                                               'sum': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                                                                               'max': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                     properties={
                                                                                                                         'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                                         'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                                     }),
                                                                                               'min': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                     properties={
                                                                                                                         'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                                         'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                                     }),
                                                                                               'average': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                         properties={
                                                                                                                             'value': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                                                                                         })
                                                                                           }),
                                       'totalManuallyUnflaggedComments': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                        properties={
                                                                                            'sum': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                                                                            'max': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                  properties={
                                                                                                                      'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                                      'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                                  }),
                                                                                            'min': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                  properties={
                                                                                                                      'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                                      'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                                  }),
                                                                                            'average': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                      properties={
                                                                                                                          'value': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                                                                                      })
                                                                                        }),
                                       'totalHatefulUsers': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                           properties={
                                                                               'sum': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                                                               'max': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                     properties={
                                                                                                         'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                         'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                     }),
                                                                               'min': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                     properties={
                                                                                                         'value': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                         'intervalData': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                     }),
                                                                               'average': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                         properties={
                                                                                                             'value': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                                                                         })
                                                                           }),
                                       'mosteHatefulUsers': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                           properties={
                                                                               'general': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                         properties={
                                                                                                             'username': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                             'ranking': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                             'totalHatefulCommentsSum': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                         }),
                                                                               'average': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                         properties={
                                                                                                             'categoryName': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                             'users': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                                     properties={
                                                                                                                                         'username': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                                                         'ranking': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                                                         'totalHatefulCommentsSum': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                                                                                                     })
                                                                                                         })
                                                                           }),
                                       'intervalDate': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                      properties={
                                                                          'intervalDate': openapi.Schema(type=openapi.TYPE_STRING),
                                                                          'totalCommentsSum': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                          'totalHatespeechCommentsSum': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                          'totalManuallyFlaggedCommentsSum': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                          'totalAutomaticallyFlaggedCommentsSum': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                          'totalManuallyUnflaggedCommentsSum': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                          'totalHatespeechComments': openapi.Schema(type=openapi.TYPE_OBJECT,
                                                                                                                    properties={
                                                                                                                        'categoryName': openapi.Schema(type=openapi.TYPE_STRING),
                                                                                                                        'totalSum': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                                                                                    }),
                                                                          'totalUsersSum': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                                      }),
                                   }),
        }
    ),
}


@swagger_auto_schema(method='post', request_body=chatgroups_details_statistics_schema,
                     responses=chatgroups_details_statistics_schema_response,
                     operation_description="This Endpoint gets the chat group details statistics for a user",
                     operation_summary="REST Endpoint to get chat group details statistic")
@api_view(['POST'])
def chatgroups_details_statistic(request):
    '''Provides the overall statistics of all chat groups for the authenticated user'''
    authg = request.user.groups.all()
    chatg = request.data['chat_groups']
    start = request.data['time_start']
    end = request.data['time_end']
    interval = request.data['time_interval']
    merged = request.data['is_merged']
    return Response(std_service.get_detailed_statistic(authg, merged, interval, start, end, chatg))

@swagger_auto_schema(method='get',
                     responses={200: ReportedCommentSerializer},
                     operation_description="This Endpoint returns a list of comments which have not been manually "
                                           "classified",
                     operation_summary="Endpoint for retrieving comments to manually classify")
@api_view(['GET'])
def list_reported_comments(request):
    """
    REST endpoint for receiving all comments which were reported by a user
    @param request: http request
    @return: http response containing all comments as list
    """
    return Response(get_all_to_manually_classify())


@swagger_auto_schema(method='get',
                     responses={200: ClassificationSerializer},
                     operation_description="This Endpoint returns a list of all available classifications",
                     operation_summary="Endpoint for retrieving all classifications in database")
@api_view(['GET'])
def list_available_classifiers(request):
    """
    REST endpoint for receiving all available classification types
    @param request: http request
    @return: http response containing all comments as list
    """
    return Response(get_available_classifications(), content_type="application/json")


@swagger_auto_schema(method='post', request_body=ManualClassificationSerializer,
                     responses={status.HTTP_200_OK: ""},
                     operation_description="This Endpoint allows to add a manual classification to a comment",
                     operation_summary="REST endpoint to manually classify comments")
@api_view(['POST'])
def classify_manual(request):
    """
    REST endpoint for manual classification
    @param request: http request
    @return: http response (code 200)
    """
    classification_serializer = ManualClassificationSerializer(data=request.data)
    if classification_serializer.is_valid():
        return Response(
            add_manual_classification_to_existing_comment(classification_serializer.validated_data.source_app_name,
                                                          classification_serializer.validated_data.source_app_comment_id,
                                                          classification_serializer.validated_data.manual_classification_id),
            status=status.HTTP_200_OK)
    else:
        return Response(classification_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
