from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from .models import User
from .serializers import UserSerializer, UserCreateSerializer

# 1. La classe UserViewSet (déjà présente, on la garde)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'activated'})

# 2. AJOUT : La vue Login
class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        # Ici on ajoute la logique de connexion (ex: avec JWT)
        return Response({"message": "Lien de connexion prêt"}, status=status.HTTP_200_OK)

# 3. AJOUT : Les vues individuelles si on préfère ne pas utiliser le ViewSet dans les URLs
class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserActivityView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk=None):
        return Response({"activities": []})