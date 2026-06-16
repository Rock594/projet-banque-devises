from django.urls import path
from . import views

urlpatterns = [
    # Route pour la connexion
    path('login/', views.LoginView.as_view(), name='login'),
    
    # Routes pour la liste et le détail
    path('', views.UserListView.as_view(), name='user-list'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # Route pour les activités
    path('<int:pk>/activities/', views.UserActivityView.as_view(), name='user-activities'),
    
    # Route pour l'activation (utilise la méthode du ViewSet)
    path('<int:pk>/activate/', views.UserViewSet.as_view({'post': 'activate'}), name='user-activate'),
]