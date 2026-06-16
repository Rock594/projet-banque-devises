from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.username', read_only=True)
    client_full_name = serializers.SerializerMethodField()
    from_currency_code = serializers.CharField(source='from_currency.code', read_only=True)
    to_currency_code = serializers.CharField(source='to_currency.code', read_only=True)
    type_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = ['id', 'transaction_id', 'client', 'client_name', 'client_full_name', 
                  'transaction_type', 'type_display', 'from_currency', 'to_currency', 
                  'from_currency_code', 'to_currency_code', 'amount_from', 'amount_to', 
                  'rate_applied', 'status', 'status_display', 'created_at']
        read_only_fields = ['transaction_id', 'created_at']
    
    def get_client_full_name(self, obj):
        return obj.client.full_name
    
    def get_type_display(self, obj):
        return dict(Transaction.TYPE_CHOICES).get(obj.transaction_type, obj.transaction_type)
    
    def get_status_display(self, obj):
        return dict(Transaction.STATUS_CHOICES).get(obj.status, obj.status)