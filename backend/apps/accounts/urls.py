from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

urlpatterns = [
    path('login/', views.login, name='login'),
    path('test-login/', views.test_login, name='test-login'),
    path('change-password/', views.change_password, name='change-password'),
    path('password-reset/request/', views.request_password_reset, name='request-password-reset'),
    path('password-reset/verify/', views.verify_reset_code, name='verify-reset-code'),
    path('password-reset/confirm/', views.reset_password, name='reset-password'),
    path('first-access/request/', views.request_first_access, name='request-first-access'),
    path('first-access/verify/', views.verify_activation_token, name='verify-activation-token'),
    path('first-access/activate/', views.activate_account, name='activate-account'),
    path('', include(router.urls)),
]
