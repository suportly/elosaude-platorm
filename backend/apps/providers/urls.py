from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SpecialtyViewSet, AccreditedProviderViewSet, ProviderReviewViewSet

router = DefaultRouter()
router.register(r'specialties', SpecialtyViewSet, basename='specialty')
router.register(r'providers', AccreditedProviderViewSet, basename='provider')
router.register(r'reviews', ProviderReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]
