import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banque.settings')
django.setup()

from apps.users.models import User
from apps.currencies.models import Currency, ExchangeRate
from apps.transactions.models import Transaction
from decimal import Decimal

def create_currencies():
    currencies = [
        {'code': 'USD', 'name': 'Dollar US', 'symbol': '$'},
        {'code': 'EUR', 'name': 'Euro', 'symbol': '€'},
        {'code': 'GBP', 'name': 'Livre Sterling', 'symbol': '£'},
        {'code': 'JPY', 'name': 'Yen Japonais', 'symbol': '¥'},
        {'code': 'MGA', 'name': 'Ariary Malgache', 'symbol': 'Ar'},
    ]
    
    for currency_data in currencies:
        Currency.objects.get_or_create(code=currency_data['code'], defaults=currency_data)
    
    print("✅ Devises créées")

def create_exchange_rates():
    usd = Currency.objects.get(code='USD')
    eur = Currency.objects.get(code='EUR')
    gbp = Currency.objects.get(code='GBP')
    mga = Currency.objects.get(code='MGA')
    
    rates = [
        (usd, eur, Decimal('0.9234'), Decimal('0.9312')),
        (usd, gbp, Decimal('0.7845'), Decimal('0.7891')),
        (eur, usd, Decimal('1.0831'), Decimal('1.0850')),
        (eur, mga, Decimal('4700'), Decimal('4750')),
    ]
    
    for from_curr, to_curr, buy, sell in rates:
        ExchangeRate.objects.get_or_create(
            from_currency=from_curr,
            to_currency=to_curr,
            defaults={'buy_rate': buy, 'sell_rate': sell}
        )
    
    print("✅ Taux de change créés")

def create_test_transactions():
    admin = User.objects.get(username='admin')
    usd = Currency.objects.get(code='USD')
    eur = Currency.objects.get(code='EUR')
    
    transactions = [
        {
            'client': admin,
            'transaction_type': 'BUY',
            'from_currency': usd,
            'to_currency': eur,
            'amount_from': Decimal('1000'),
            'amount_to': Decimal('923.40'),
            'rate_applied': Decimal('0.9234'),
            'status': 'COMPLETED'
        },
        {
            'client': admin,
            'transaction_type': 'SELL',
            'from_currency': eur,
            'to_currency': usd,
            'amount_from': Decimal('500'),
            'amount_to': Decimal('541.55'),
            'rate_applied': Decimal('1.0831'),
            'status': 'PENDING'
        },
    ]
    
    for tx_data in transactions:
        Transaction.objects.create(**tx_data)
    
    print("Transactions de test créées")

if __name__ == '__main__':
    print("Création des données de test...")
    create_currencies()
    create_exchange_rates()
    create_test_transactions()
    print("Opération terminée!")