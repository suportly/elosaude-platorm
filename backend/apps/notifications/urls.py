from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, PushTokenViewSet, SystemMessageViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'push-tokens', PushTokenViewSet, basename='pushtoken')
router.register(r'system-messages', SystemMessageViewSet, basename='systemmessage')

urlpatterns = [
    path('', include(router.urls)),
]
