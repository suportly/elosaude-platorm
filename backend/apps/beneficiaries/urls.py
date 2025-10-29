from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, HealthPlanViewSet, BeneficiaryViewSet, DigitalCardViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'health-plans', HealthPlanViewSet, basename='healthplan')
router.register(r'beneficiaries', BeneficiaryViewSet, basename='beneficiary')
router.register(r'digital-cards', DigitalCardViewSet, basename='digitalcard')

urlpatterns = [
    path('', include(router.urls)),
]
