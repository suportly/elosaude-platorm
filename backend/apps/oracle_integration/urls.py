"""
Oracle Integration URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OracleCardViewSet, OracleCarteirasUnificadasViewSet

router = DefaultRouter()
router.register(r'oracle-cards', OracleCardViewSet, basename='oracle-cards')
router.register(r'carteirinhas-unificadas', OracleCarteirasUnificadasViewSet, basename='carteirinhas-unificadas')

urlpatterns = [
    path('', include(router.urls)),
]
