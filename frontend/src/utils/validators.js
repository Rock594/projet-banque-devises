// ✅ Gestion des erreurs: Validateurs complets
export const validators = {
  // Validation email
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'L\'email est requis';
    if (!regex.test(email)) return 'Format d\'email invalide';
    return null;
  },

  // Validation mot de passe
  password: (password) => {
    if (!password) return 'Le mot de passe est requis';
    if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
    if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins une majuscule';
    if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins une minuscule';
    if (!/[0-9]/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre';
    return null;
  },

  // Validation téléphone
  phone: (phone) => {
    const regex = /^[0-9+\-\s]{10,15}$/;
    if (phone && !regex.test(phone)) return 'Format de téléphone invalide';
    return null;
  },

  // Validation montant
  amount: (amount, min = 0.01, max = 1000000) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return 'Le montant doit être un nombre';
    if (num < min) return `Le montant doit être au moins ${min}`;
    if (num > max) return `Le montant ne peut pas dépasser ${max}`;
    return null;
  },
};

// ✅ Signifiance: Messages d'erreur explicites
export const getErrorMessage = (error) => {
  if (!error) return null;
  
  if (typeof error === 'string') return error;
  
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Une erreur est survenue. Veuillez réessayer.';
};