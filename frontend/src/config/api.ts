// API configuration for RAPP authentication system
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  
  // API endpoints
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    LOGOUT_ALL: '/api/auth/logout-all',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    SET_PASSWORD: '/api/auth/set-password',
    
    // OAuth endpoints
    OAUTH_GOOGLE: '/api/auth/oauth/google',
    GOOGLE_AUTH: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
    PROVIDERS: '/api/auth/providers',
    UNLINK_OAUTH: '/api/auth/oauth', // /{provider}
    
    // Session management
    SESSIONS: '/api/auth/sessions',
    REVOKE_SESSION: '/api/auth/sessions', // /{id}
    
    // Profile management endpoints
    PROFILES: '/api/profiles',
    PROFILES_CURRENT: '/api/profiles/current',
    PROFILES_SWITCH: '/api/profiles/switch',
    PROFILES_COMPANY: '/api/profiles/company',
    PROFILES_VENDOR: '/api/profiles/vendor',
    
    // Legacy endpoints (for backward compatibility)
    COMPANIES: '/api/auth/companies',
    COMPLETE_PROFILE: '/api/auth/complete-profile',
  },
  
  // Helper function to get full URL
  getFullUrl: (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  },
  
  // Helper function for OAuth URLs
  getOAuthUrl: (provider: 'google'): string => {
    return `${API_CONFIG.BASE_URL}/auth/${provider}`;
  }
};

// Environment helper
export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
};

export default API_CONFIG;
