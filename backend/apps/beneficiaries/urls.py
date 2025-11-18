from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, HealthPlanViewSet, BeneficiaryViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'health-plans', HealthPlanViewSet, basename='healthplan')
router.register(r'beneficiaries', BeneficiaryViewSet, basename='beneficiary')

urlpatterns = [
    path('', include(router.urls)),
]
