"""HateMate_Backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from HateMate_Backend.auth.auth_view import CustomTokenRefreshView, ObtainPairWithUserAndGroupView, CustomTokenVerifyView
from HateMate_Backend_App.Client_Interface import bot_interface
from HateMate_Backend_App.Client_Interface import statistic_interface
from django.contrib import admin
from django.urls import path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="H8M8",
        default_version='V0.1',
        description="Swagger/OpenAPI specification",
    ),
    public=True,
    permission_classes=[permissions.AllowAny]
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('bot/classify/', bot_interface.classify),
    path('auth/token/', ObtainPairWithUserAndGroupView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', CustomTokenVerifyView.as_view(), name='token_verify'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
    path('bot/session/', bot_interface.session_create),
    path('bot/session/refresh/', bot_interface.session_refresh),
    path('bot/session/close/', bot_interface.session_close),
    path('statistic/chatgroups/', statistic_interface.chatgroups_statistic),
    path('statistic/details/', statistic_interface.chatgroups_details_statistic),
    path('bot/comment/report/', bot_interface.report_comment),
    path('statistic/comment/reports/', statistic_interface.list_reported_comments),
    path('statistic/comment/classifications/', statistic_interface.list_available_classifiers),
    path('statistic/classify/manual/', statistic_interface.classify_manual)
]
