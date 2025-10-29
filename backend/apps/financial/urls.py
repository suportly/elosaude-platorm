from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, PaymentHistoryViewSet, UsageHistoryViewSet, TaxStatementViewSet

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentHistoryViewSet, basename='payment')
router.register(r'usage', UsageHistoryViewSet, basename='usage')
router.register(r'tax-statements', TaxStatementViewSet, basename='taxstatement')

urlpatterns = [
    path('', include(router.urls)),
]
