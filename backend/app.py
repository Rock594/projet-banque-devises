from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"])

# ============ DONNÉES INITIALES ============

USERS = [
    {'id': 1, 'username': 'admin', 'email': 'rockefellerrabobason@gmail.com', 'first_name': 'Admin', 'last_name': 'System', 'full_name': 'Admin System', 'role': 'SUPER_ADMIN', 'role_display': 'Super Administrateur', 'is_active': True, 'avatar': 'https://randomuser.me/api/portraits/men/1.jpg'},
    {'id': 2, 'username': 'Sophie Martin', 'email': 'manager@gmail.com', 'first_name': 'Sophie', 'last_name': 'Martin', 'full_name': 'Sophie Martin', 'role': 'MANAGER', 'role_display': 'Manager', 'is_active': True, 'avatar': 'https://randomuser.me/api/portraits/women/2.jpg'},
    {'id': 3, 'username': 'Jean Dupont', 'email': 'caissier@gmail.com', 'first_name': 'Jean', 'last_name': 'Dupont', 'full_name': 'Jean Dupont', 'role': 'TELLER', 'role_display': 'Caissier', 'is_active': True, 'avatar': 'https://randomuser.me/api/portraits/men/3.jpg'},
    {'id': 4, 'username': 'Marius Rabobason', 'email': 'rabobasonmarius@gmail.com', 'first_name': 'Marius', 'last_name': 'Rabobason', 'full_name': 'Marius Rabobason', 'role': 'TELLER', 'role_display': 'Caissier', 'is_active': True, 'avatar': 'https://randomuser.me/api/portraits/men/4.jpg'},
]

TRANSACTIONS = [
    {'id': 1, 'transaction_id': 'TX89210', 'client_name': 'Jean Dupont', 'client_id': 1, 'transaction_type': 'SELL', 'type_display': 'Vente', 'from_currency_code': 'EUR', 'to_currency_code': 'USD', 'amount_from': 1085.00, 'amount_to': 1085.00, 'rate_applied': 1.0850, 'status': 'COMPLETED', 'status_display': 'Complétée', 'created_at': '2024-04-03T10:30:00Z', 'notes': ''},
    {'id': 2, 'transaction_id': 'TX89209', 'client_name': 'Sarah Smith', 'client_id': 2, 'transaction_type': 'BUY', 'type_display': 'Achat', 'from_currency_code': 'USD', 'to_currency_code': 'GBP', 'amount_from': 921.60, 'amount_to': 921.60, 'rate_applied': 0.7845, 'status': 'COMPLETED', 'status_display': 'Complétée', 'created_at': '2024-04-03T09:15:00Z', 'notes': ''},
    {'id': 3, 'transaction_id': 'TX89208', 'client_name': 'Marc Lambert', 'client_id': 3, 'transaction_type': 'SELL', 'type_display': 'Vente', 'from_currency_code': 'USD', 'to_currency_code': 'JPY', 'amount_from': 14920.00, 'amount_to': 14920.00, 'rate_applied': 149.20, 'status': 'PENDING', 'status_display': 'En attente', 'created_at': '2024-04-02T14:20:00Z', 'notes': ''},
]

# Devises avec is_base_currency
CURRENCIES = [
    {'id': 1, 'code': 'USD', 'name': 'Dollar US', 'symbol': '$', 'is_base_currency': True},
    {'id': 2, 'code': 'EUR', 'name': 'Euro', 'symbol': '€', 'is_base_currency': False},
    {'id': 3, 'code': 'GBP', 'name': 'Livre Sterling', 'symbol': '£', 'is_base_currency': False},
    {'id': 4, 'code': 'JPY', 'name': 'Yen Japonais', 'symbol': '¥', 'is_base_currency': False},
    {'id': 5, 'code': 'MGA', 'name': 'Ariary Malagasy', 'symbol': 'Ar', 'is_base_currency': False},
]

RATES = [
    {'id': 1, 'pair': 'EUR/USD', 'from_currency_code': 'EUR', 'to_currency_code': 'USD', 'buy_rate': 1.0831, 'sell_rate': 1.0850, 'change': '+0.12%', 'trend': 'up'},
    {'id': 2, 'pair': 'GBP/USD', 'from_currency_code': 'GBP', 'to_currency_code': 'USD', 'buy_rate': 1.2631, 'sell_rate': 1.2650, 'change': '-0.05%', 'trend': 'down'},
    {'id': 3, 'pair': 'USD/JPY', 'from_currency_code': 'USD', 'to_currency_code': 'JPY', 'buy_rate': 148.21, 'sell_rate': 148.35, 'change': '+0.44%', 'trend': 'up'},
]

NOTIFICATIONS = [
    {'id': 1, 'user_id': 1, 'message': 'Bienvenue sur GlobalBank Exchange', 'type': 'success', 'read': False, 'created_at': datetime.now().isoformat()},
]

SETTINGS = {
    'institution_name': 'GlobalBank',
    'contact_email': 'rabobasonmarius@gmail.com',
    'default_fee_percentage': 0.5,
    'currency_base': 'USD'
}

def add_notification(user_id, message, type_notif='info'):
    new_id = len(NOTIFICATIONS) + 1
    new_notif = {'id': new_id, 'user_id': user_id, 'message': message, 'type': type_notif, 'read': False, 'created_at': datetime.now().isoformat()}
    NOTIFICATIONS.append(new_notif)
    return new_id

# ============ AUTH ============
@app.route('/api/auth/login/', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    for user in USERS:
        if user['username'] == username and password == 'Admin123!':
            add_notification(user['id'], f"Connexion réussie de {username}", 'success')
            return jsonify({'access': f'token_{user["id"]}', 'refresh': f'refresh_{user["id"]}', 'user': user})
    return jsonify({'error': 'Identifiants incorrects'}), 401

# ============ USERS ============
@app.route('/api/users/', methods=['GET', 'OPTIONS'])
def get_users():
    if request.method == 'OPTIONS':
        return '', 200
    search = request.args.get('search', '')
    role = request.args.get('role', '')
    status = request.args.get('status', '')
    
    results = USERS.copy()
    if search:
        results = [u for u in results if search.lower() in u['username'].lower() or search.lower() in u['email'].lower()]
    if role:
        results = [u for u in results if u['role'] == role]
    if status:
        is_active = status == 'actif'
        results = [u for u in results if u['is_active'] == is_active]
    return jsonify({'results': results, 'count': len(results)})

@app.route('/api/users/', methods=['POST', 'OPTIONS'])
def create_user():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    new_id = max([u['id'] for u in USERS]) + 1
    new_user = {
        'id': new_id, 'username': data.get('username'), 'email': data.get('email'),
        'first_name': data.get('first_name', ''), 'last_name': data.get('last_name', ''),
        'full_name': f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
        'role': data.get('role', 'TELLER'), 'role_display': 'Caissier' if data.get('role') == 'TELLER' else 'Manager',
        'is_active': True, 'avatar': f"https://randomuser.me/api/portraits/men/{new_id}.jpg"
    }
    USERS.append(new_user)
    add_notification(1, f"Nouvel utilisateur {new_user['username']} créé", 'success')
    return jsonify(new_user), 201

@app.route('/api/users/<int:user_id>/', methods=['PUT', 'PATCH', 'OPTIONS'])
def update_user(user_id):
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    for i, user in enumerate(USERS):
        if user['id'] == user_id:
            USERS[i].update(data)
            USERS[i]['full_name'] = f"{data.get('first_name', user['first_name'])} {data.get('last_name', user['last_name'])}".strip()
            add_notification(1, f"Utilisateur {user['username']} modifié", 'info')
            return jsonify(USERS[i])
    return jsonify({'error': 'Utilisateur non trouvé'}), 404

@app.route('/api/users/<int:user_id>/deactivate/', methods=['POST', 'OPTIONS'])
def deactivate_user(user_id):
    if request.method == 'OPTIONS':
        return '', 200
    for i, user in enumerate(USERS):
        if user['id'] == user_id:
            USERS[i]['is_active'] = False
            add_notification(1, f"Utilisateur {user['username']} désactivé", 'warning')
            return jsonify({'success': True})
    return jsonify({'error': 'Utilisateur non trouvé'}), 404

@app.route('/api/users/<int:user_id>/activate/', methods=['POST', 'OPTIONS'])
def activate_user(user_id):
    if request.method == 'OPTIONS':
        return '', 200
    for i, user in enumerate(USERS):
        if user['id'] == user_id:
            USERS[i]['is_active'] = True
            add_notification(1, f"Utilisateur {user['username']} activé", 'success')
            return jsonify({'success': True})
    return jsonify({'error': 'Utilisateur non trouvé'}), 404

# ============ TRANSACTIONS ============
@app.route('/api/transactions/', methods=['GET', 'OPTIONS'])
def get_transactions():
    if request.method == 'OPTIONS':
        return '', 200
    search = request.args.get('search', '')
    type_filter = request.args.get('type', '')
    status_filter = request.args.get('status', '')
    limit = request.args.get('limit')
    
    results = TRANSACTIONS.copy()
    if search:
        results = [t for t in results if search.lower() in t['client_name'].lower() or search.lower() in t['transaction_id'].lower()]
    if type_filter:
        results = [t for t in results if t['transaction_type'] == type_filter]
    if status_filter:
        results = [t for t in results if t['status'] == status_filter]
    if limit:
        results = results[:int(limit)]
    return jsonify({'results': results, 'count': len(results)})

@app.route('/api/transactions/', methods=['POST', 'OPTIONS'])
def create_transaction():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    new_id = len(TRANSACTIONS) + 1
    new_transaction = {
        'id': new_id, 'transaction_id': f"TX{100000 + new_id}", 'client_name': data.get('client_name', 'Client'),
        'client_id': data.get('client'), 'transaction_type': data.get('transaction_type', 'BUY'),
        'type_display': 'Achat' if data.get('transaction_type') == 'BUY' else 'Vente',
        'from_currency_code': 'USD', 'to_currency_code': 'EUR', 'amount_from': float(data.get('amount_from', 0)),
        'amount_to': float(data.get('amount_from', 0)), 'rate_applied': float(data.get('rate_applied', 1)),
        'status': 'PENDING', 'status_display': 'En attente', 'created_at': datetime.now().isoformat(),
        'notes': data.get('notes', '')
    }
    TRANSACTIONS.append(new_transaction)
    add_notification(1, f"Nouvelle transaction {new_transaction['transaction_id']} créée", 'success')
    return jsonify(new_transaction), 201

@app.route('/api/transactions/summary/', methods=['GET', 'OPTIONS'])
def get_summary():
    if request.method == 'OPTIONS':
        return '', 200
    total_volume = sum(t['amount_from'] for t in TRANSACTIONS)
    return jsonify({
        'today': {'total_volume': total_volume, 'count': len(TRANSACTIONS), 'completed': len([t for t in TRANSACTIONS if t['status'] == 'COMPLETED'])},
        'yesterday': {'total_volume': total_volume * 0.9, 'count': int(len(TRANSACTIONS) * 0.9)},
        'variation': 12.5, 'by_currency': [{'from_currency__code': 'USD', 'count': 54}, {'from_currency__code': 'EUR', 'count': 42}]
    })

# ============ CRUD DEVISES COMPLET ============

@app.route('/api/currencies/', methods=['GET', 'OPTIONS'])
def get_currencies():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify(CURRENCIES)

@app.route('/api/currencies/<int:currency_id>/', methods=['GET', 'OPTIONS'])
def get_currency(currency_id):
    if request.method == 'OPTIONS':
        return '', 200
    for currency in CURRENCIES:
        if currency['id'] == currency_id:
            return jsonify(currency)
    return jsonify({'error': 'Devise non trouvée'}), 404

@app.route('/api/currencies/', methods=['POST', 'OPTIONS'])
def create_currency():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    
    # Vérifier si le code existe déjà
    code_upper = data.get('code').upper()
    for c in CURRENCIES:
        if c['code'] == code_upper:
            return jsonify({'error': 'Ce code devise existe déjà'}), 400
    
    new_id = max([c['id'] for c in CURRENCIES]) + 1
    new_currency = {
        'id': new_id, 'code': code_upper, 'name': data.get('name'),
        'symbol': data.get('symbol'), 'is_base_currency': data.get('is_base_currency', False)
    }
    
    # Si c'est la devise de base, désactiver les autres
    if new_currency['is_base_currency']:
        for c in CURRENCIES:
            c['is_base_currency'] = False
    
    CURRENCIES.append(new_currency)
    add_notification(1, f"Nouvelle devise {new_currency['code']} ajoutée", 'success')
    return jsonify(new_currency), 201

@app.route('/api/currencies/<int:currency_id>/', methods=['PUT', 'OPTIONS'])
def update_currency(currency_id):
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    for i, currency in enumerate(CURRENCIES):
        if currency['id'] == currency_id:
            new_code = data.get('code', currency['code']).upper()
            # Vérifier si le nouveau code n'existe pas déjà
            for c in CURRENCIES:
                if c['code'] == new_code and c['id'] != currency_id:
                    return jsonify({'error': 'Ce code devise existe déjà'}), 400
            
            CURRENCIES[i]['code'] = new_code
            CURRENCIES[i]['name'] = data.get('name', currency['name'])
            CURRENCIES[i]['symbol'] = data.get('symbol', currency['symbol'])
            CURRENCIES[i]['is_base_currency'] = data.get('is_base_currency', currency.get('is_base_currency', False))
            
            # Gérer la devise de base
            if CURRENCIES[i]['is_base_currency']:
                for j, c in enumerate(CURRENCIES):
                    if j != i:
                        c['is_base_currency'] = False
            
            add_notification(1, f"Devise {currency['code']} modifiée", 'info')
            return jsonify(CURRENCIES[i])
    return jsonify({'error': 'Devise non trouvée'}), 404

@app.route('/api/currencies/<int:currency_id>/', methods=['DELETE', 'OPTIONS'])
def delete_currency(currency_id):
    if request.method == 'OPTIONS':
        return '', 200
    for i, currency in enumerate(CURRENCIES):
        if currency['id'] == currency_id:
            if currency.get('is_base_currency', False):
                return jsonify({'error': 'Impossible de supprimer la devise de base'}), 400
            # Vérifier si la devise est utilisée dans des transactions
            for t in TRANSACTIONS:
                if t['from_currency_code'] == currency['code'] or t['to_currency_code'] == currency['code']:
                    return jsonify({'error': 'Cette devise est utilisée dans des transactions'}), 400
            deleted = CURRENCIES.pop(i)
            add_notification(1, f"Devise {deleted['code']} supprimée", 'warning')
            return jsonify({'success': True, 'message': f"Devise {deleted['code']} supprimée"})
    return jsonify({'error': 'Devise non trouvée'}), 404

# ============ TAUX DE CHANGE ============
@app.route('/api/currencies/rates/current/', methods=['GET', 'OPTIONS'])
def get_current_rates():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify(RATES)

# ============ NOTIFICATIONS ============
@app.route('/api/notifications/', methods=['GET', 'OPTIONS'])
def get_all_notifications():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = request.args.get('user_id', 1, type=int)
    user_notifications = [n for n in NOTIFICATIONS if n['user_id'] == user_id]
    user_notifications.sort(key=lambda x: x['created_at'], reverse=True)
    return jsonify(user_notifications)

@app.route('/api/notifications/count/', methods=['GET', 'OPTIONS'])
def get_notifications_count():
    if request.method == 'OPTIONS':
        return '', 200
    user_id = request.args.get('user_id', 1, type=int)
    unread_count = len([n for n in NOTIFICATIONS if n['user_id'] == user_id and not n['read']])
    return jsonify({'count': unread_count})

@app.route('/api/notifications/<int:notif_id>/read/', methods=['POST', 'OPTIONS'])
def mark_notification_read(notif_id):
    if request.method == 'OPTIONS':
        return '', 200
    for n in NOTIFICATIONS:
        if n['id'] == notif_id:
            n['read'] = True
            return jsonify({'success': True})
    return jsonify({'error': 'Non trouvé'}), 404

@app.route('/api/notifications/read-all/', methods=['POST', 'OPTIONS'])
def mark_all_notifications_read():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json() or {}
    user_id = data.get('user_id', 1)
    for n in NOTIFICATIONS:
        if n['user_id'] == user_id:
            n['read'] = True
    return jsonify({'success': True})

@app.route('/api/notifications/add/', methods=['POST', 'OPTIONS'])
def add_notification_route():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    add_notification(data.get('user_id', 1), data.get('message', ''), data.get('type', 'info'))
    return jsonify({'success': True})

# ============ SETTINGS ============
@app.route('/api/settings/', methods=['GET', 'OPTIONS'])
def get_settings():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify(SETTINGS)

@app.route('/api/settings/', methods=['PUT', 'OPTIONS'])
def update_settings():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    if data:
        SETTINGS.update(data)
        add_notification(1, "Paramètres système mis à jour", 'info')
    return jsonify(SETTINGS)

# ============ REPORTS ============
@app.route('/api/reports/transactions/', methods=['GET', 'OPTIONS'])
def generate_report():
    if request.method == 'OPTIONS':
        return '', 200
    total_volume = sum(t['amount_from'] for t in TRANSACTIONS)
    add_notification(1, "Rapport des transactions généré", 'success')
    return jsonify({
        'generated_at': datetime.now().isoformat(), 'total_transactions': len(TRANSACTIONS),
        'total_volume': total_volume, 'average_amount': total_volume / len(TRANSACTIONS) if TRANSACTIONS else 0,
        'transactions': TRANSACTIONS
    })

# ============ AUDIT ============
@app.route('/api/audit/', methods=['GET', 'OPTIONS'])
def get_audit_logs():
    if request.method == 'OPTIONS':
        return '', 200
    logs = [
        {'id': 1, 'user': 'admin', 'action': 'Connexion', 'details': 'Connexion réussie', 'ip': '127.0.0.1', 'timestamp': datetime.now().isoformat()},
        {'id': 2, 'user': 'admin', 'action': 'Création transaction', 'details': 'Transaction créée', 'ip': '127.0.0.1', 'timestamp': datetime.now().isoformat()},
    ]
    return jsonify(logs)


# ============ EMAIL NOTIFICATIONS ============
from email_service import send_email_sync, get_transaction_email_template, get_welcome_email_template, get_alert_email_template, notification_logs

@app.route('/api/email/send-transaction/', methods=['POST', 'OPTIONS'])
def send_transaction_email():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    transaction = data.get('transaction', {})
    user_email = data.get('email')
    user_name = data.get('name', 'Client')
    
    if not user_email:
        return jsonify({'error': 'Email non fourni'}), 400
    
    html_body = get_transaction_email_template(transaction, user_name)
    success = send_email_sync(user_email, f"Confirmation transaction {transaction.get('transaction_id', '')}", html_body)
    
    return jsonify({'success': success, 'message': 'Email envoyé' if success else 'Erreur envoi'})

@app.route('/api/email/send-welcome/', methods=['POST', 'OPTIONS'])
def send_welcome_email():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    user_email = data.get('email')
    user_name = data.get('name', 'Client')
    
    if not user_email:
        return jsonify({'error': 'Email non fourni'}), 400
    
    html_body = get_welcome_email_template(user_name)
    success = send_email_sync(user_email, "Bienvenue sur GlobalBank Exchange", html_body)
    
    return jsonify({'success': success})

@app.route('/api/email/send-alert/', methods=['POST', 'OPTIONS'])
def send_alert_email():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    user_email = data.get('email')
    rate_info = data.get('rate', {})
    
    if not user_email:
        return jsonify({'error': 'Email non fourni'}), 400
    
    html_body = get_alert_email_template(rate_info)
    success = send_email_sync(user_email, f"Alerte Taux - {rate_info.get('pair', 'Devise')}", html_body)
    
    return jsonify({'success': success})

@app.route('/api/email/logs/', methods=['GET', 'OPTIONS'])
def get_email_logs():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify(notification_logs)

@app.route('/api/email/test/', methods=['POST', 'OPTIONS'])
def test_email():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    test_email = data.get('email', 'rabobasonmarius@gmail.com')
    
    test_html = """
    <html>
    <body>
        <h1>Test Email</h1>
        <p>Ceci est un test de configuration email.</p>
        <p>Si vous recevez cet email, la configuration est correcte !</p>
    </body>
    </html>
    """
    
    success = send_email_sync(test_email, "Test GlobalBank Exchange", test_html)
    return jsonify({'success': success, 'message': 'Email de test envoyé' if success else 'Erreur'})



if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("🚀 SERVEUR GLOBALBANK DÉMARRÉ")
    print("=" * 60)
    print("📡 API: http://localhost:8000")
    print("\n📋 IDENTIFIANTS DE TEST:")
    print("   👑 Admin:    admin / Admin123!")
    print("   👤 Manager:  Sophie Martin / Admin123!")
    print("   💳 Caissier: Jean Dupont / Admin123!")
    print("=" * 60 + "\n")
    app.run(port=8000, debug=True)