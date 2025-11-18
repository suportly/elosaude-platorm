"""
URL configuration for elosaude_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accounts.views import CPFTokenObtainPairView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

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
    path('api/', include('apps.oracle_integration.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
