from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime

# Données mockées
USERS = [
    {'id': 1, 'username': 'admin', 'email': 'admin@gmail.com', 'first_name': 'Admin', 'last_name': 'System', 'full_name': 'Admin System', 'role': 'SUPER_ADMIN', 'role_display': 'Super Administrateur', 'is_active': True, 'avatar': 'https://randomuser.me/api/portraits/men/1.jpg'},
    {'id': 2, 'username': 'manager', 'email': 'manager@gmail.com', 'first_name': 'Sophie', 'last_name': 'Martin', 'full_name': 'Sophie Martin', 'role': 'MANAGER', 'role_display': 'Manager', 'is_active': True, 'avatar': 'https://randomuser.me/api/portraits/women/2.jpg'},
    {'id': 3, 'username': 'caissier', 'email': 'caissier@gmail.com', 'first_name': 'Jean', 'last_name': 'Dupont', 'full_name': 'Jean Dupont', 'role': 'TELLER', 'role_display': 'Caissier', 'is_active': True, 'avatar': 'https://randomuser.me/api/portraits/men/3.jpg'},
]

TRANSACTIONS = [
    {'id': 1, 'transaction_id': 'TX89210', 'client_name': 'Jean Dupont', 'transaction_type': 'SELL', 'type_display': 'Vente', 'from_currency_code': 'EUR', 'to_currency_code': 'USD', 'amount_from': 1000.00, 'amount_to': 1085.00, 'rate_applied': 1.0850, 'status': 'COMPLETED', 'status_display': 'Complétée', 'created_at': '2024-04-03T10:30:00Z'},
    {'id': 2, 'transaction_id': 'TX89209', 'client_name': 'Sarah Smith', 'transaction_type': 'BUY', 'type_display': 'Achat', 'from_currency_code': 'USD', 'to_currency_code': 'GBP', 'amount_from': 5000.00, 'amount_to': 3922.50, 'rate_applied': 0.7845, 'status': 'COMPLETED', 'status_display': 'Complétée', 'created_at': '2024-04-03T09:15:00Z'},
    {'id': 3, 'transaction_id': 'TX89208', 'client_name': 'Marc Lambert', 'transaction_type': 'SELL', 'type_display': 'Vente', 'from_currency_code': 'USD', 'to_currency_code': 'JPY', 'amount_from': 10000.00, 'amount_to': 1492000.00, 'rate_applied': 149.20, 'status': 'PENDING', 'status_display': 'En attente', 'created_at': '2024-04-02T14:20:00Z'},
]

RATES = [
    {'id': 1, 'pair': 'EUR/USD', 'from_currency_code': 'EUR', 'to_currency_code': 'USD', 'buy_rate': 1.0831, 'sell_rate': 1.0850, 'change': '+0.12%'},
    {'id': 2, 'pair': 'GBP/USD', 'from_currency_code': 'GBP', 'to_currency_code': 'USD', 'buy_rate': 1.2631, 'sell_rate': 1.2650, 'change': '-0.05%'},
    {'id': 3, 'pair': 'USD/JPY', 'from_currency_code': 'USD', 'to_currency_code': 'JPY', 'buy_rate': 148.21, 'sell_rate': 148.35, 'change': '+0.44%'},
]

NOTIFICATIONS = [
    {'id': 1, 'user_id': 1, 'message': 'Nouvelle transaction de Jean Dupont', 'type': 'transaction', 'read': False, 'created_at': datetime.now().isoformat()},
    {'id': 2, 'user_id': 1, 'message': 'Taux USD/EUR mis à jour', 'type': 'rate', 'read': False, 'created_at': datetime.now().isoformat()},
]

CURRENCIES = [
    {'id': 1, 'code': 'USD', 'name': 'Dollar US', 'symbol': '$'},
    {'id': 2, 'code': 'EUR', 'name': 'Euro', 'symbol': '€'},
    {'id': 3, 'code': 'GBP', 'name': 'Livre Sterling', 'symbol': '£'},
    {'id': 4, 'code': 'JPY', 'name': 'Yen Japonais', 'symbol': '¥'},
    {'id': 5, 'code': 'MGA', 'name': 'Ariary Malagasy', 'symbol': 'Ar'},
]

SETTINGS = {
    'institution_name': 'GlobalBank',
    'contact_email': 'rabobasonmarius@gmail.com',
    'default_fee_percentage': 0.5,
    'currency_base': 'USD'
}

@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        # Pour les tests, accepter admin/Admin123!
        if username == 'admin' and password == 'Admin123!':
            user = USERS[0]
            return JsonResponse({
                'access': 'access_token_123',
                'refresh': 'refresh_token_456',
                'user': user
            })
        
        # Accepter n'importe quel identifiant pour les tests
        return JsonResponse({
            'access': 'test_token',
            'refresh': 'test_refresh',
            'user': {'id': 1, 'username': username, 'role': 'MANAGER', 'full_name': username}
        })
    except:
        return JsonResponse({'error': 'Erreur de connexion'}, status=400)

def api_users(request):
    search = request.GET.get('search', '')
    results = USERS.copy()
    if search:
        results = [u for u in results if search.lower() in u['username'].lower() or search.lower() in u['email'].lower()]
    return JsonResponse({'results': results, 'count': len(results)})

def api_transactions(request):
    limit = request.GET.get('limit')
    results = TRANSACTIONS.copy()
    if limit:
        results = results[:int(limit)]
    return JsonResponse({'results': results, 'count': len(results)})

def api_transactions_summary(request):
    total_volume = sum(t['amount_from'] for t in TRANSACTIONS)
    return JsonResponse({
        'today': {'total_volume': total_volume, 'count': len(TRANSACTIONS), 'completed': len([t for t in TRANSACTIONS if t['status'] == 'COMPLETED'])},
        'yesterday': {'total_volume': total_volume * 0.9, 'count': int(len(TRANSACTIONS) * 0.9)},
        'variation': 12.5,
        'by_currency': [{'from_currency__code': 'USD', 'count': 54}, {'from_currency__code': 'EUR', 'count': 42}]
    })

def api_rates(request):
    return JsonResponse(RATES, safe=False)

def api_currencies(request):
    return JsonResponse(CURRENCIES, safe=False)

def api_notifications(request):
    return JsonResponse(NOTIFICATIONS, safe=False)

def api_settings(request):
    return JsonResponse(SETTINGS)

@csrf_exempt
def api_update_settings(request):
    global SETTINGS
    data = json.loads(request.body)
    SETTINGS.update(data)
    return JsonResponse(SETTINGS)

@csrf_exempt
def api_create_transaction(request):
    data = json.loads(request.body)
    new_id = len(TRANSACTIONS) + 1
    new_transaction = {
        'id': new_id,
        'transaction_id': f"TX{100000 + new_id}",
        'client_name': f"Client {new_id}",
        'transaction_type': data.get('transaction_type', 'BUY'),
        'type_display': 'Achat' if data.get('transaction_type') == 'BUY' else 'Vente',
        'from_currency_code': 'USD',
        'to_currency_code': 'EUR',
        'amount_from': float(data.get('amount_from', 0)),
        'amount_to': float(data.get('amount_from', 0)) * float(data.get('rate_applied', 1)),
        'rate_applied': float(data.get('rate_applied', 1)),
        'status': 'PENDING',
        'status_display': 'En attente',
        'created_at': datetime.now().isoformat()
    }
    TRANSACTIONS.append(new_transaction)
    return JsonResponse(new_transaction, status=201)