from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import auth, dashboard, users, providers, reimbursements, reports, settings

app_name = 'admin_api'

router = DefaultRouter()

urlpatterns = [
    # Auth endpoints
    path('auth/login/', auth.AdminLoginView.as_view(), name='admin-login'),
    path('auth/refresh/', auth.AdminTokenRefreshView.as_view(), name='admin-token-refresh'),
    path('auth/me/', auth.AdminProfileView.as_view(), name='admin-profile'),

    # Dashboard endpoints
    path('dashboard/metrics/', dashboard.DashboardMetricsView.as_view(), name='dashboard-metrics'),
    path('dashboard/activity/', dashboard.RecentActivityView.as_view(), name='dashboard-activity'),

    # Users endpoints
    path('users/', users.UserListCreateView.as_view(), name='user-list'),
    path('users/<int:pk>/', users.UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/deactivate/', users.UserDeactivateView.as_view(), name='user-deactivate'),

    # Providers endpoints
    path('providers/', providers.ProviderListView.as_view(), name='provider-list'),
    path('providers/<int:pk>/', providers.ProviderDetailView.as_view(), name='provider-detail'),
    path('providers/<int:pk>/approve/', providers.ProviderApproveView.as_view(), name='provider-approve'),
    path('providers/<int:pk>/reject/', providers.ProviderRejectView.as_view(), name='provider-reject'),

    # Reimbursements endpoints
    path('reimbursements/', reimbursements.ReimbursementListView.as_view(), name='reimbursement-list'),
    path('reimbursements/<int:pk>/', reimbursements.ReimbursementDetailView.as_view(), name='reimbursement-detail'),
    path('reimbursements/<int:pk>/approve/', reimbursements.ReimbursementApproveView.as_view(), name='reimbursement-approve'),
    path('reimbursements/<int:pk>/reject/', reimbursements.ReimbursementRejectView.as_view(), name='reimbursement-reject'),
    path('reimbursements/<int:pk>/history/', reimbursements.ReimbursementHistoryView.as_view(), name='reimbursement-history'),

    # Reports endpoints
    path('reports/generate/', reports.ReportGenerateView.as_view(), name='report-generate'),
    path('reports/export/<str:format>/', reports.ReportExportView.as_view(), name='report-export'),

    # Settings endpoints
    path('settings/', settings.SettingsListView.as_view(), name='settings-list'),
    path('settings/<str:key>/', settings.SettingsDetailView.as_view(), name='settings-detail'),
    path('settings/history/', settings.SettingsHistoryView.as_view(), name='settings-history'),

    # Audit logs
    path('audit-logs/', dashboard.AuditLogListView.as_view(), name='audit-log-list'),

    # Router URLs
    path('', include(router.urls)),
]
