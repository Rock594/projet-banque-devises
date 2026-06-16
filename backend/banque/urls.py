from django.contrib import admin
from django.urls import path
from . import api_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', api_views.api_login, name='login'),
    path('api/users/', api_views.api_users, name='users'),
    path('api/transactions/', api_views.api_transactions, name='transactions'),
    path('api/transactions/summary/', api_views.api_transactions_summary, name='summary'),
    path('api/currencies/rates/current/', api_views.api_rates, name='rates'),
    path('api/currencies/', api_views.api_currencies, name='currencies'),
    path('api/notifications/', api_views.api_notifications, name='notifications'),
    path('api/settings/', api_views.api_settings, name='settings'),
    path('api/settings/', api_views.api_update_settings, name='update_settings'),
]