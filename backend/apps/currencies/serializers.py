from rest_framework import serializers
from .models import Currency, ExchangeRate

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['id', 'code', 'name', 'symbol']

class ExchangeRateSerializer(serializers.ModelSerializer):
    from_currency_code = serializers.CharField(source='from_currency.code', read_only=True)
    to_currency_code = serializers.CharField(source='to_currency.code', read_only=True)
    pair = serializers.SerializerMethodField()
    
    class Meta:
        model = ExchangeRate
        fields = ['id', 'from_currency', 'to_currency', 'from_currency_code', 'to_currency_code', 
                  'pair', 'buy_rate', 'sell_rate', 'updated_at']
    
    def get_pair(self, obj):
        return f"{obj.from_currency.code}/{obj.to_currency.code}"