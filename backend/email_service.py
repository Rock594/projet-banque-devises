import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import threading

# Configuration SMTP (à modifier avec vos identifiants)
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',  # Pour Gmail
    'smtp_port': 587,
    'sender_email': 'rabobasonmarius@gmail.com',  
    'sender_password': 'Rock0384797398@feller',  
    'use_tls': True
}

# File d'attente des emails
email_queue = []
notification_logs = []

def send_email_async(to_email, subject, body, user_id=1):
    """Ajoute un email à la file d'attente"""
    email = {
        'id': len(email_queue) + 1,
        'to': to_email,
        'subject': subject,
        'body': body,
        'user_id': user_id,
        'status': 'pending',
        'created_at': datetime.now().isoformat()
    }
    email_queue.append(email)
    
    # Traiter l'email immédiatement
    return send_email_sync(to_email, subject, body)

def send_email_sync(to_email, subject, body):
    """Envoie un email synchronement"""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = EMAIL_CONFIG['sender_email']
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Version HTML
        html_part = MIMEText(body, 'html')
        msg.attach(html_part)
        
        # Connexion au serveur SMTP
        server = smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port'])
        if EMAIL_CONFIG['use_tls']:
            server.starttls()
        server.login(EMAIL_CONFIG['sender_email'], EMAIL_CONFIG['sender_password'])
        server.send_message(msg)
        server.quit()
        
        # Journaliser l'envoi
        notification_logs.append({
            'id': len(notification_logs) + 1,
            'to': to_email,
            'subject': subject,
            'status': 'sent',
            'sent_at': datetime.now().isoformat()
        })
        
        print(f"✅ Email envoyé à {to_email}")
        return True
    except Exception as e:
        print(f"❌ Erreur envoi email: {e}")
        notification_logs.append({
            'id': len(notification_logs) + 1,
            'to': to_email,
            'subject': subject,
            'status': 'failed',
            'error': str(e),
            'sent_at': datetime.now().isoformat()
        })
        return False

# ============ TEMPLATES D'EMAILS ============

def get_transaction_email_template(transaction, user_name):
    """Génère le template HTML pour une transaction"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #0f49bd; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .footer {{ text-align: center; padding: 10px; font-size: 12px; color: #666; }}
            .button {{ background-color: #0f49bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
            .transaction-details {{ background-color: white; padding: 15px; border-radius: 8px; margin: 10px 0; }}
            .status-completed {{ color: green; font-weight: bold; }}
            .status-pending {{ color: orange; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>GlobalBank Exchange</h1>
                <p>Confirmation de transaction</p>
            </div>
            <div class="content">
                <p>Bonjour <strong>{user_name}</strong>,</p>
                <p>Nous vous confirmons que votre transaction a été effectuée.</p>
                
                <div class="transaction-details">
                    <h3>📊 Détails de la transaction</h3>
                    <p><strong>ID Transaction :</strong> {transaction.get('transaction_id', 'N/A')}</p>
                    <p><strong>Type :</strong> {transaction.get('type_display', 'N/A')}</p>
                    <p><strong>Montant :</strong> {transaction.get('amount_from', 0):,.2f} €</p>
                    <p><strong>Taux appliqué :</strong> {transaction.get('rate_applied', 'N/A')}</p>
                    <p><strong>Date :</strong> {datetime.now().strftime('%d/%m/%Y à %H:%M')}</p>
                    <p><strong>Statut :</strong> <span class="status-completed">✅ Complétée</span></p>
                </div>
                
                <p style="text-align: center;">
                    <a href="http://localhost:3000/transactions" class="button">Voir mes transactions</a>
                </p>
                
                <p>Pour toute question, contactez notre service client.</p>
            </div>
            <div class="footer">
                <p>© 2024 GlobalBank Exchange - Sécurisé et fiable</p>
                <p>Cet email est un message automatique, merci de ne pas y répondre.</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_welcome_email_template(user_name):
    """Génère le template d'email de bienvenue"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #0f49bd; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .footer {{ text-align: center; padding: 10px; font-size: 12px; color: #666; }}
            .button {{ background-color: #0f49bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Bienvenue sur GlobalBank Exchange</h1>
            </div>
            <div class="content">
                <p>Bonjour <strong>{user_name}</strong>,</p>
                <p>Nous sommes ravis de vous accueillir sur GlobalBank Exchange, votre plateforme de confiance pour la gestion des devises.</p>
                
                <h3>✨ Ce que vous pouvez faire :</h3>
                <ul>
                    <li>💱 Consulter les taux de change en temps réel</li>
                    <li>💰 Effectuer des transactions de change</li>
                    <li>📊 Suivre l'historique de vos opérations</li>
                    <li>📈 Obtenir des rapports détaillés</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="http://localhost:3000" class="button">Accéder à mon espace</a>
                </p>
                
                <p>Identifiants de connexion :<br>
                <strong>Email :</strong> {user_name}@globalbank.com<br>
                <strong>Mot de passe :</strong> Défini lors de l'inscription</p>
            </div>
            <div class="footer">
                <p>© 2024 GlobalBank Exchange - Votre banque en ligne</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_alert_email_template(rate_info):
    """Génère le template d'alerte de taux"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #0f49bd; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .alert {{ background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; }}
            .footer {{ text-align: center; padding: 10px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📈 Alerte Taux de Change</h1>
            </div>
            <div class="content">
                <div class="alert">
                    <p><strong>⚠️ Alerte importante</strong></p>
                    <p>La paire <strong>{rate_info.get('pair', 'N/A')}</strong> a varié de <strong>{rate_info.get('change', '0%')}</strong></p>
                    <p>Nouveau taux : <strong>{rate_info.get('buy_rate', 'N/A')}</strong> (achat) / <strong>{rate_info.get('sell_rate', 'N/A')}</strong> (vente)</p>
                </div>
                
                <p>Consultez les détails sur votre espace client.</p>
                
                <p style="text-align: center;">
                    <a href="http://localhost:3000/rates" class="button">Voir les taux</a>
                </p>
            </div>
            <div class="footer">
                <p>© 2024 GlobalBank Exchange</p>
            </div>
        </div>
    </body>
    </html>
    """