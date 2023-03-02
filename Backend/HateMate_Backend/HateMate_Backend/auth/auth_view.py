from django.contrib.auth.models import User
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import serializers, status
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenVerifySerializer, \
    TokenRefreshSerializer
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.views import (TokenRefreshView, TokenVerifyView, TokenObtainPairView, )


class TokenRefreshResponseSerializer(serializers.Serializer):
    """
    Class for Swagger to display response correctly
    """

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    access = serializers.CharField()
    username = serializers.CharField()
    groups = serializers.ListField(child=serializers.CharField(), min_length=0)


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # get user from id sent by jwt
        user = getUserObjectFromToken(UntypedToken(attrs["refresh"]))

        # Add extra responses here
        data['username'] = user.username
        data['groups'] = user.groups.values_list('name', flat=True)

        return data


class CustomTokenRefreshView(TokenRefreshView):
    # Override RefreshView to add Swagger Doc for auth

    serializer_class = CustomTokenRefreshSerializer

    @swagger_auto_schema(responses={status.HTTP_200_OK: TokenRefreshResponseSerializer,
                                    status.HTTP_401_UNAUTHORIZED: openapi.Response(
                                        description="HTTP 401 if Token is invalid or expired")},
                         operation_summary="Refresh a Token",
                         operation_description="Refresh a token by sending the refesh token. This request will generate a new access "
                                               "token that can be used")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class ObtainPairSerializerWithUserAndGroup(TokenObtainPairSerializer):
    """
    Override Obtain Serializer Class to add username and group to Token
    """

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)

        # Add extra responses here
        data['username'] = self.user.username
        data['groups'] = self.user.groups.values_list('name', flat=True)
        return data


class ObtainPairWithUserAndGroupViewResponseSerializer(serializers.Serializer):
    """
    Class for Swagger to display response correctly
    """

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    access = serializers.CharField()
    refresh = serializers.CharField()
    username = serializers.CharField()
    groups = serializers.ListField(child=serializers.CharField(), min_length=0)


class ObtainPairWithUserAndGroupView(TokenObtainPairView):
    # Override Obtain Class to add Swagger Doc for auth

    serializer_class = ObtainPairSerializerWithUserAndGroup

    @swagger_auto_schema(responses={status.HTTP_200_OK: ObtainPairWithUserAndGroupViewResponseSerializer,
                                    status.HTTP_401_UNAUTHORIZED: openapi.Response(
                                        description="HTTP 401 if credentials are invalid")},
                         operation_summary="Create a JWT Token for Authentication")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class CustomTokenVerifySerializer(TokenVerifySerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # get user from id sent by jwt
        user = getUserObjectFromToken(UntypedToken(attrs["token"]))

        # Add extra responses here
        data['username'] = user.username
        data['groups'] = user.groups.values_list('name', flat=True)

        return data


class CustomVerifyResponseSerializer(serializers.Serializer):
    """
    Class for Swagger to display response correctly
    """

    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    username = serializers.CharField()
    groups = serializers.ListField(child=serializers.CharField(), min_length=0)


class CustomTokenVerifyView(TokenVerifyView):
    serializer_class = CustomTokenVerifySerializer

    @swagger_auto_schema(responses={status.HTTP_200_OK: CustomVerifyResponseSerializer,
                                    status.HTTP_401_UNAUTHORIZED: openapi.Response(
                                        description="HTTP 401 if Token is not valid")},
                         operation_summary="Verify that a token is valid")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


def getUserObjectFromToken(token):
    user_id = token.get("user_id")
    return User.objects.get(id=user_id)
