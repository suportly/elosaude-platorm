"""
URL configuration for elosaude_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.db import connection
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accounts.views import CPFTokenObtainPairView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from datetime import datetime


def health_status(request):
    """
    Health check endpoint for infrastructure monitoring.
    Returns 200 if the service is healthy, 503 if unhealthy.
    """
    status = {
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'service': 'elosaude-backend',
        'version': '1.0.0',
    }

    # Check database connectivity
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        status['database'] = 'ok'
    except Exception as e:
        status['status'] = 'degraded'
        status['database'] = 'error'
        status['database_error'] = str(e)

    http_status = 200 if status['status'] == 'ok' else 503
    return JsonResponse(status, status=http_status)


schema_view = get_schema_view(
    openapi.Info(
        title="Elosaúde API",
        default_version='v1',
        description="API for Elosaúde Health Management System",
        contact=openapi.Contact(email="contact@elosaude.com"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Health check endpoint (no auth required) - for infrastructure monitoring
    path('api/status/', health_status, name='health_status'),

    path('admin/', admin.site.urls),

    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # Authentication
    path('api/auth/login/', CPFTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App URLs
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/beneficiaries/', include('apps.beneficiaries.urls')),
    path('api/providers/', include('apps.providers.urls')),
    path('api/guides/', include('apps.guides.urls')),
    path('api/reimbursements/', include('apps.reimbursements.urls')),
    path('api/financial/', include('apps.financial.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/uploads/', include('apps.uploads.urls')),
    path('api/health/', include('apps.health_records.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
