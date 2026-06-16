from django.db import models
from apps.users.models import User
from apps.currencies.models import Currency

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('BUY', 'Achat'),
        ('SELL', 'Vente'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('COMPLETED', 'Complétée'),
        ('CANCELLED', 'Annulée'),
    ]
    
    transaction_id = models.CharField(max_length=20, unique=True)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    from_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='transactions_from')
    to_currency = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='transactions_to')
    amount_from = models.DecimalField(max_digits=15, decimal_places=2)
    amount_to = models.DecimalField(max_digits=15, decimal_places=2)
    rate_applied = models.DecimalField(max_digits=10, decimal_places=4)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.transaction_id:
            import uuid
            self.transaction_id = f"TX{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.transaction_id} - {self.client.username}"