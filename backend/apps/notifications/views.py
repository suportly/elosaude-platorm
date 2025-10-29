from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import models
from .models import Notification, PushToken, SystemMessage
from .serializers import NotificationSerializer, PushTokenSerializer, SystemMessageSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['notification_type', 'priority', 'is_read']
    ordering_fields = ['created_at', 'priority']

    def get_queryset(self):
        # Filter notifications for current user's beneficiary only
        try:
            beneficiary = self.request.user.beneficiary
            return self.queryset.filter(beneficiary=beneficiary)
        except:
            return self.queryset.none()

    @action(detail=False, methods=['get'])
    def my_notifications(self, request):
        '''Get notifications for current user's beneficiary'''
        queryset = self.get_queryset()

        # Apply filters from query params
        is_read = request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')

        # Order by newest first
        queryset = queryset.order_by('-created_at')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        '''Get count of unread notifications'''
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        '''Mark notification as read'''
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        '''Mark all notifications as read'''
        updated_count = self.get_queryset().filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({'marked_as_read': updated_count})


class PushTokenViewSet(viewsets.ModelViewSet):
    queryset = PushToken.objects.all()
    serializer_class = PushTokenSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['device_type', 'is_active']

    def get_queryset(self):
        # Filter tokens for current user's beneficiary only
        try:
            beneficiary = self.request.user.beneficiary
            return self.queryset.filter(beneficiary=beneficiary)
        except:
            return self.queryset.none()

    @action(detail=False, methods=['post'])
    def register_device(self, request):
        '''Register or update push token for device'''
        token = request.data.get('token')
        device_type = request.data.get('device_type', 'IOS')
        
        if not token:
            return Response(
                {'error': 'token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            beneficiary = request.user.beneficiary
        except:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Deactivate old tokens for same beneficiary
        PushToken.objects.filter(beneficiary=beneficiary).update(is_active=False)
        
        # Create or update token
        push_token, created = PushToken.objects.update_or_create(
            beneficiary=beneficiary,
            token=token,
            defaults={'device_type': device_type, 'is_active': True}
        )
        
        serializer = self.get_serializer(push_token)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class SystemMessageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SystemMessage.objects.all()
    serializer_class = SystemMessageSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['message_type', 'is_active']
    ordering_fields = ['start_date', 'created_at']

    @action(detail=False, methods=['get'])
    def active_messages(self, request):
        '''Get currently active system messages'''
        now = timezone.now().date()
        messages = self.queryset.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        )
        
        # Filter by user's company/plan if applicable
        try:
            beneficiary = request.user.beneficiary
            messages = messages.filter(
                models.Q(target_all=True) |
                models.Q(target_companies=beneficiary.company) |
                models.Q(target_plans=beneficiary.health_plan)
            )
        except:
            messages = messages.filter(target_all=True)
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
