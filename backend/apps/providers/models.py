from django.db import models
from django.db.models import Avg
from django.utils.translation import gettext_lazy as _


class Specialty(models.Model):
    """Medical specialties"""
    name = models.CharField(max_length=100, unique=True, verbose_name=_('Specialty Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Specialty')
        verbose_name_plural = _('Specialties')
        ordering = ['name']

    def __str__(self):
        return self.name


class AccreditedProvider(models.Model):
    """Accredited healthcare providers"""
    PROVIDER_TYPES = [
        ('DOCTOR', _('Doctor')),
        ('CLINIC', _('Clinic')),
        ('LABORATORY', _('Laboratory')),
        ('HOSPITAL', _('Hospital')),
        ('PHARMACY', _('Pharmacy')),
    ]

    provider_type = models.CharField(max_length=20, choices=PROVIDER_TYPES, verbose_name=_('Type'))
    name = models.CharField(max_length=200, verbose_name=_('Name'))
    trade_name = models.CharField(max_length=200, blank=True, verbose_name=_('Trade Name'))
    cnpj = models.CharField(max_length=14, unique=True, null=True, blank=True, verbose_name=_('CNPJ'))
    crm = models.CharField(max_length=20, null=True, blank=True, verbose_name=_('CRM'))  # For doctors

    # Contact info
    phone = models.CharField(max_length=20, verbose_name=_('Phone'))
    email = models.EmailField(verbose_name=_('Email'))
    website = models.URLField(blank=True, verbose_name=_('Website'))

    # Address
    address = models.TextField(verbose_name=_('Address'))
    city = models.CharField(max_length=100, verbose_name=_('City'))
    state = models.CharField(max_length=2, verbose_name=_('State'))
    zip_code = models.CharField(max_length=8, verbose_name=_('ZIP Code'))
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name=_('Latitude'))
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name=_('Longitude'))

    # Specialties
    specialties = models.ManyToManyField(Specialty, related_name='providers', verbose_name=_('Specialties'))

    # Services
    accepts_telemedicine = models.BooleanField(default=False, verbose_name=_('Accepts Telemedicine'))
    accepts_emergency = models.BooleanField(default=False, verbose_name=_('Accepts Emergency'))
    working_hours = models.JSONField(default=dict, verbose_name=_('Working Hours'))
    # Format: {"monday": {"open": "08:00", "close": "18:00"}, ...}

    # Rating
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0, verbose_name=_('Rating'))
    total_reviews = models.IntegerField(default=0, verbose_name=_('Total Reviews'))

    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Accredited Provider')
        verbose_name_plural = _('Accredited Providers')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.get_provider_type_display()}"

    def update_rating(self):
        """Update provider rating based on reviews"""
        reviews = self.reviews.all()
        if reviews.exists():
            avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
            self.rating = round(avg_rating, 2)
            self.total_reviews = reviews.count()
            self.save(update_fields=['rating', 'total_reviews'])
        else:
            self.rating = 0
            self.total_reviews = 0
            self.save(update_fields=['rating', 'total_reviews'])


class ProviderReview(models.Model):
    """Reviews for providers"""
    provider = models.ForeignKey(AccreditedProvider, on_delete=models.CASCADE, related_name='reviews')
    beneficiary = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.CASCADE, related_name='provider_reviews')
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)], verbose_name=_('Rating'))
    comment = models.TextField(blank=True, verbose_name=_('Comment'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Provider Review')
        verbose_name_plural = _('Provider Reviews')
        ordering = ['-created_at']
        unique_together = ['provider', 'beneficiary']

    def __str__(self):
        return f"{self.provider.name} - {self.rating} stars"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update provider rating
        self.provider.update_rating()

    def delete(self, *args, **kwargs):
        provider = self.provider
        super().delete(*args, **kwargs)
        provider.update_rating()
