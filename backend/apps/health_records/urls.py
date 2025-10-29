from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HealthRecordViewSet, VaccinationViewSet

router = DefaultRouter()
router.register(r'health-records', HealthRecordViewSet, basename='healthrecord')
router.register(r'vaccinations', VaccinationViewSet, basename='vaccination')

urlpatterns = [
    path('', include(router.urls)),
]
