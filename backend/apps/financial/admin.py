from django.contrib import admin
from .models import Invoice, PaymentHistory, UsageHistory, TaxStatement


class PaymentHistoryInline(admin.TabularInline):
    model = PaymentHistory
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['beneficiary', 'reference_month', 'amount', 'due_date', 'payment_date', 'status']
    list_filter = ['status', 'reference_month', 'due_date']
    search_fields = ['beneficiary__full_name', 'barcode']
    readonly_fields = ['barcode', 'digitable_line', 'created_at', 'updated_at']
    inlines = [PaymentHistoryInline]


@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'payment_method', 'payment_date', 'amount_paid', 'transaction_id']
    list_filter = ['payment_method', 'payment_date']
    search_fields = ['invoice__beneficiary__full_name', 'transaction_id']
    readonly_fields = ['created_at']


@admin.register(UsageHistory)
class UsageHistoryAdmin(admin.ModelAdmin):
    list_display = ['beneficiary', 'period', 'consultations_count', 'exams_count', 'total_amount']
    list_filter = ['period']
    search_fields = ['beneficiary__full_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TaxStatement)
class TaxStatementAdmin(admin.ModelAdmin):
    list_display = ['beneficiary', 'year', 'total_paid', 'deductible_amount']
    list_filter = ['year']
    search_fields = ['beneficiary__full_name']
    readonly_fields = ['created_at', 'updated_at']
