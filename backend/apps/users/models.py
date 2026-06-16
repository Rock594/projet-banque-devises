from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('SUPER_ADMIN', 'Super Administrateur'),
        ('ADMIN', 'Administrateur'),
        ('MANAGER', 'Manager'),
        ('TELLER', 'Caissier'),
        ('AUDITOR', 'Auditeur'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='TELLER')
    phone_number = models.CharField(max_length=20, blank=True)
    
    def __str__(self):
        return self.username
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    @property
    def role_display(self):
        return dict(self.ROLE_CHOICES).get(self.role, self.role)