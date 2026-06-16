from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Currency, ExchangeRate
from .serializers import CurrencySerializer, ExchangeRateSerializer

class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = [IsAuthenticated]

class ExchangeRateViewSet(viewsets.ModelViewSet):
    queryset = ExchangeRate.objects.all()
    serializer_class = ExchangeRateSerializer
    permission_classes = [IsAuthenticated]