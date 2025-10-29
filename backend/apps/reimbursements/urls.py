from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReimbursementRequestViewSet, ReimbursementDocumentViewSet

router = DefaultRouter()
router.register(r'requests', ReimbursementRequestViewSet, basename='request')
router.register(r'documents', ReimbursementDocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
]
