"""
Auto-generate serializers, views, and URLs for all Django apps
"""
import os

# Define the structure for each app
APP_CONFIGS = {
    'beneficiaries': {
        'models': ['Company', 'HealthPlan', 'Beneficiary', 'DigitalCard'],
        'app_name': 'beneficiaries'
    },
    'providers': {
        'models': ['Specialty', 'AccreditedProvider', 'ProviderReview'],
        'app_name': 'providers'
    },
    'guides': {
        'models': ['Procedure', 'TISSGuide', 'GuideProcedure', 'GuideAttachment'],
        'app_name': 'guides'
    },
    'reimbursements': {
        'models': ['ReimbursementRequest', 'ReimbursementDocument'],
        'app_name': 'reimbursements'
    },
    'financial': {
        'models': ['Invoice', 'PaymentHistory', 'UsageHistory', 'TaxStatement'],
        'app_name': 'financial'
    },
    'notifications': {
        'models': ['Notification', 'PushToken', 'SystemMessage'],
        'app_name': 'notifications'
    },
}


def generate_serializers(app_name, models):
    """Generate serializers for an app"""
    content = f"""from rest_framework import serializers
from .models import {', '.join(models)}

"""

    for model in models:
        content += f"""
class {model}Serializer(serializers.ModelSerializer):
    class Meta:
        model = {model}
        fields = '__all__'

"""

    with open(f'apps/{app_name}/serializers.py', 'w') as f:
        f.write(content)


def generate_views(app_name, models):
    """Generate viewsets for an app"""
    content = f"""from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import {', '.join(models)}
from .serializers import {', '.join([f'{m}Serializer' for m in models])}

"""

    for model in models:
        content += f"""
class {model}ViewSet(viewsets.ModelViewSet):
    queryset = {model}.objects.all()
    serializer_class = {model}Serializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

"""

    with open(f'apps/{app_name}/views.py', 'w') as f:
        f.write(content)


def generate_urls(app_name, models):
    """Generate URLs for an app"""
    content = f"""from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
"""

    for model in models:
        model_lower = ''.join(['_' + c.lower() if c.isupper() else c for c in model]).lstrip('_')
        content += f"router.register(r'{model_lower}s', views.{model}ViewSet)\n"

    content += """
urlpatterns = [
    path('', include(router.urls)),
]
"""

    with open(f'apps/{app_name}/urls.py', 'w') as f:
        f.write(content)


def main():
    for app_name, config in APP_CONFIGS.items():
        print(f"Generating API files for {app_name}...")
        generate_serializers(app_name, config['models'])

        # Only generate views/urls if not accounts (already created)
        if app_name != 'accounts':
            generate_views(app_name, config['models'])
            generate_urls(app_name, config['models'])

        print(f"✓ {app_name} complete")


if __name__ == '__main__':
    main()
    print("\n✓ All API files generated successfully!")
