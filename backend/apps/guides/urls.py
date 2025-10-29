from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProcedureViewSet, TISSGuideViewSet, GuideAttachmentViewSet

router = DefaultRouter()
router.register(r'procedures', ProcedureViewSet, basename='procedure')
router.register(r'guides', TISSGuideViewSet, basename='guide')
router.register(r'attachments', GuideAttachmentViewSet, basename='attachment')

urlpatterns = [
    path('', include(router.urls)),
]
