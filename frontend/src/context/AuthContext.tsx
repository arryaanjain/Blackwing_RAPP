import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import authService from '../services/authService';
import httpClient from '../services/httpClient';

// Configure axios
axios.defaults.baseURL = API_CONFIG.BASE_URL;
axios.defaults.withCredentials = true;

interface Profile {
  id: string;
  name: string;
  type: 'company' | 'vendor';
  status: 'active' | 'inactive';
  is_complete: boolean;
  is_current?: boolean;
  identifier?: string;
  share_id?: string;
  blockchain_tx_hash?: string;
  // Company specific fields
  company_name?: string;
  business_type?: string;
  gst_number?: string;
  // Vendor specific fields
  vendor_name?: string;
  specialization?: string;
  // Common fields
  location?: string;
  description?: string;
  contact_phone?: string;
  website?: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  has_password: boolean;
  current_profile?: Profile;
  current_profile_type?: string;
  current_profile_id?: number;
  profiles?: Profile[];
  available_profiles?: Profile[];
  wallet_balance?: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  currentProfile: Profile | null;
  availableProfiles: Profile[];
  needsProfileSetup: boolean;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
  fetchFreshUserData: () => Promise<void>;
  handleAuthError: (error: any) => void;
  setToken: (token: string) => void;
  setPassword: (password: string, passwordConfirmation: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithGoogle: () => Promise<void>;
  handleOAuthCallback: (encodedTokens: string) => Promise<void>;

  // Profile management methods
  createVendorProfile: (profileData: any) => Promise<Profile>;
  createCompanyProfile: (profileData: any) => Promise<Profile>;
  updateProfile: (profileId: string, profileType: 'company' | 'vendor', profileData: any) => Promise<Profile>;
  switchProfile: (profileType: 'company' | 'vendor') => Promise<void>;
  switchToProfileType: (profileType: 'company' | 'vendor') => Promise<void>;
  updateVendorProfile: (profileId: string, profileData: any) => Promise<Profile>;
  updateCompanyProfile: (profileId: string, profileData: any) => Promise<Profile>;
  getAvailableProfiles: () => Promise<Profile[]>;
  checkVendorProfile: () => Promise<{ has_vendor_profile: boolean; vendor_profile: Profile | null }>;
  checkCompanyProfile: () => Promise<{ has_company_profile: boolean; company_profile: Profile | null }>;

  // Computed properties
  hasVendorProfiles: boolean;
  hasCompanyProfiles: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Store tokens securely and clean up any legacy data
  const storeTokens = (accessToken: string, refreshToken: string, userData: User) => {
    // Clean up any legacy auth keys first
    cleanupLegacyAuthData();

    // Ensure user has a current_profile set if they have profiles but no current_profile
    if (userData.available_profiles && userData.available_profiles.length > 0 && !userData.current_profile) {
      // Check localStorage for intended profile type first
      const intendedType = localStorage.getItem('current_profile_type');
      let defaultProfile = null;

      if (intendedType) {
        // Use the intended profile type if available
        defaultProfile = userData.available_profiles.find((p: Profile) => p.type === intendedType);
        localStorage.removeItem('current_profile_type'); // Clean up
      }

      // Fallback to first complete profile
      if (!defaultProfile) {
        defaultProfile = userData.available_profiles.find((p: Profile) => p.is_complete);
      }

      // Fallback to first profile
      if (!defaultProfile) {
        defaultProfile = userData.available_profiles[0];
      }

      if (defaultProfile) {
        userData.current_profile = defaultProfile;
        console.log('Setting default current_profile:', defaultProfile);
      }
    }

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    // Set default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  };

  // Clean up legacy and deprecated auth data
  const cleanupLegacyAuthData = () => {
    // Remove deprecated auth keys
    const deprecatedKeys = ['token', 'loggedIn', 'session_id', 'auth_token', 'rapp_auth'];
    deprecatedKeys.forEach(key => localStorage.removeItem(key));

    console.warn('🧹 AuthContext: Cleaned up deprecated auth keys.');
  };

  // Clear tokens and only auth-related data
  const clearTokens = () => {
    // Clear all auth-related data from localStorage
    const authKeys = ['access_token', 'refresh_token', 'user', 'current_profile'];
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear React state
    setUser(null);

    // Clear axios default header
    delete axios.defaults.headers.common['Authorization'];

    console.log('🧹 AuthContext: Cleared all auth tokens and state');
  };

  // Refresh tokens
  const refreshTokens = async (): Promise<boolean> => {
    const storedRefreshToken = localStorage.getItem('refresh_token');

    if (!storedRefreshToken) {
      clearTokens();
      return false;
    }

    try {
      const response = await axios.post(API_CONFIG.ENDPOINTS.REFRESH, {
        refresh_token: storedRefreshToken
      });

      const { access_token, refresh_token, user: userData } = response.data;

      storeTokens(access_token, refresh_token, userData);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearTokens();
      return false;
    }
  };

  // Setup axios interceptors for automatic token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Never retry the refresh endpoint itself — that would cause an infinite loop
        const isRefreshRequest = originalRequest?.url?.includes(API_CONFIG.ENDPOINTS.REFRESH);

        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
          originalRequest._retry = true;

          const refreshSuccess = await refreshTokens();
          if (refreshSuccess) {
            // Retry the original request with new token
            const newToken = localStorage.getItem('access_token');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');

      if (accessToken && refreshToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);

          // Ensure user has a current_profile set if they have profiles but no current_profile
          if (userData.available_profiles && userData.available_profiles.length > 0 && !userData.current_profile) {
            // Check localStorage for intended profile type first
            const intendedType = localStorage.getItem('current_profile_type');
            let defaultProfile = null;

            if (intendedType) {
              // Use the intended profile type if available
              defaultProfile = userData.available_profiles.find((p: Profile) => p.type === intendedType);
              localStorage.removeItem('current_profile_type'); // Clean up
            }

            // Fallback to first complete profile
            if (!defaultProfile) {
              defaultProfile = userData.available_profiles.find((p: Profile) => p.is_complete);
            }

            // Fallback to first profile
            if (!defaultProfile) {
              defaultProfile = userData.available_profiles[0];
            }

            if (defaultProfile) {
              userData.current_profile = defaultProfile;
              console.log('Setting default current_profile on checkAuth:', defaultProfile);
            }
          }

          setUser(userData);
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // Verify token validity — the interceptor handles refresh automatically on 401
          // Do NOT manually call refreshTokens() here; doing so would cause a double-rotation
          // (interceptor rotates the token, then this catch block tries the stale token again)
          try {
            await axios.get(API_CONFIG.ENDPOINTS.ME);
          } catch (error: any) {
            // Interceptor already attempted refresh on 401.
            // If it succeeded the request was retried and we never reach here.
            // If it failed (both access + refresh token invalid), clear and fall through.
            if (error?.response?.status === 401) {
              clearTokens();
            }
          }
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          clearTokens();
        }
      }
    } catch (error) {
      clearTokens();
    } finally {
      setLoading(false);
    }
  };

  // Fetch fresh user data from server and update state
  const fetchFreshUserData = async (): Promise<void> => {
    try {
      const response = await httpClient.get(API_CONFIG.ENDPOINTS.ME);
      const freshUserData = response.data.user;

      console.log('✅ Fetched fresh user data:', freshUserData);

      // Update both state and localStorage with fresh data
      setUser(freshUserData);
      localStorage.setItem('user', JSON.stringify(freshUserData));
    } catch (error: any) {
      console.error('❌ Failed to fetch fresh user data:', error);

      // If it's a 401 error, the httpClient interceptor will handle it
      // and redirect to home page, so we don't need to do anything here
      if (error.response?.status === 401) {
        console.log('🔑 Auth error detected, httpClient will handle redirect');
        return;
      }

      throw error;
    }
  };

  // Handle authentication errors consistently
  const handleAuthError = (error: any) => {
    console.error('🔐 Auth error detected:', error);

    // Check if it's a 401 or auth-related error
    if (error.response?.status === 401 ||
      error.message?.includes('token') ||
      error.message?.includes('auth')) {

      console.log('🚪 Clearing auth state and redirecting to home');

      // Use httpClient's clearAuth method for consistent cleanup
      httpClient.clearAuth();
    }
  };

  const setToken = (token: string) => {
    // This method is for backward compatibility with OAuth callback
    localStorage.setItem('access_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    checkAuth();
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(API_CONFIG.ENDPOINTS.LOGIN, {
        email,
        password,
      });

      const { access_token, refresh_token, user } = response.data;
      storeTokens(access_token, refresh_token, user);
    } catch (error: any) {
      // Pass through the entire error object so components can access response data
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      const response = await axios.post(API_CONFIG.ENDPOINTS.REGISTER, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      const { access_token, refresh_token, user } = response.data;
      storeTokens(access_token, refresh_token, user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await httpClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
    } catch (error) {
      // Even if the API call fails, we should clear local auth state
      console.error('Logout API call failed:', error);
    } finally {
      // Use httpClient's clearAuth method for consistent cleanup
      httpClient.clearAuth();
    }
  };

  const logoutAll = async () => {
    try {
      await httpClient.post(API_CONFIG.ENDPOINTS.LOGOUT_ALL);
    } catch (error) {
      console.error('Logout all API call failed:', error);
    } finally {
      // Use httpClient's clearAuth method for consistent cleanup
      httpClient.clearAuth();
    }
  };

  const setPassword = async (password: string, passwordConfirmation: string) => {
    try {
      const response = await axios.post(API_CONFIG.ENDPOINTS.SET_PASSWORD, {
        password,
        password_confirmation: passwordConfirmation,
      });

      // Update user data to reflect password is now set
      if (user) {
        const updatedUser = { ...user, has_password: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // Profile management methods
  const createCompanyProfile = async (profileData: any): Promise<Profile> => {
    try {
      console.log('🚀 Creating Company Profile with payload:', profileData);
      const response = await httpClient.post(API_CONFIG.ENDPOINTS.PROFILES_COMPANY, profileData);

      // Update user data with new profile
      if (user) {
        const currentProfiles = user.available_profiles || [];
        const updatedUser = {
          ...user,
          available_profiles: [...currentProfiles, response.data.profile],
          current_profile: response.data.profile
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response.data.profile;
    } catch (error: any) {
      console.error('❌ Company Profile Creation Error:', error.response?.data || error.message);
      throw error;
    }
  };

  const createVendorProfile = async (profileData: any): Promise<Profile> => {
    try {
      console.log('🚀 Creating Vendor Profile with payload:', profileData);
      const response = await httpClient.post(API_CONFIG.ENDPOINTS.PROFILES_VENDOR, profileData);

      // Update user data with new profile
      if (user) {
        const currentProfiles = user.available_profiles || [];
        const updatedUser = {
          ...user,
          available_profiles: [...currentProfiles, response.data.profile],
          current_profile: response.data.profile
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response.data.profile;
    } catch (error: any) {
      console.error('❌ Vendor Profile Creation Error:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateProfile = async (profileId: string, profileType: 'company' | 'vendor', profileData: any): Promise<Profile> => {
    try {
      const endpoint = profileType === 'company'
        ? `${API_CONFIG.ENDPOINTS.PROFILES_COMPANY}/${profileId}`
        : `${API_CONFIG.ENDPOINTS.PROFILES_VENDOR}/${profileId}`;

      console.log(`🚀 Updating ${profileType} profile ${profileId}:`, profileData);
      const response = await httpClient.put(endpoint, profileData);

      // Update user data with updated profile
      if (user) {
        const currentProfiles = user.available_profiles || [];
        const updatedProfiles = currentProfiles.map(p =>
          p.id === profileId ? response.data.profile : p
        );
        const updatedUser = {
          ...user,
          available_profiles: updatedProfiles,
          current_profile: user.current_profile?.id === profileId ? response.data.profile : user.current_profile
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response.data.profile;
    } catch (error: any) {
      throw error;
    }
  };

  const switchProfile = async (profileType: 'company' | 'vendor'): Promise<void> => {
    try {
      await authService.switchProfile(profileType);

      // Refresh user data from server to get updated profile info
      await checkAuth();
    } catch (error: any) {
      throw error;
    }
  };

  const switchToProfileType = async (profileType: 'company' | 'vendor'): Promise<void> => {
    try {
      await authService.switchProfile(profileType);

      // Refresh user data from server to get updated profile info
      await checkAuth();
    } catch (error: any) {
      throw error;
    }
  };

  const getAvailableProfiles = async (): Promise<Profile[]> => {
    try {
      const response = await axios.get(API_CONFIG.ENDPOINTS.PROFILES);
      return response.data.profiles || [];
    } catch (error: any) {
      throw error;
    }
  };

  const checkCompanyProfile = async (): Promise<{ has_company_profile: boolean; company_profile: Profile | null }> => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/profiles/check/company`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  const checkVendorProfile = async (): Promise<{ has_vendor_profile: boolean; vendor_profile: Profile | null }> => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/profiles/check/vendor`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    // Redirect to Google OAuth
    window.location.href = API_CONFIG.getOAuthUrl('google');
  };

  const signupWithGoogle = async () => {
    // Redirect to Google OAuth (same as login, user creation handled on backend)
    window.location.href = API_CONFIG.getOAuthUrl('google');
  };

  // Handle OAuth callback with encoded tokens
  const handleOAuthCallback = async (encodedTokens: string) => {
    try {
      const decoded = JSON.parse(atob(encodedTokens));
      const { access_token, refresh_token, user: userData } = decoded;

      if (access_token && refresh_token && userData) {
        storeTokens(access_token, refresh_token, userData);
      } else {
        throw new Error('Invalid token data received from OAuth callback');
      }
    } catch (error) {
      console.error('Failed to process OAuth callback:', error);
      throw new Error('OAuth callback processing failed');
    }
  };

  // Wrapper methods for specific profile types
  const updateVendorProfile = async (profileId: string, profileData: any): Promise<Profile> => {
    return updateProfile(profileId, 'vendor', profileData);
  };

  const updateCompanyProfile = async (profileId: string, profileData: any): Promise<Profile> => {
    return updateProfile(profileId, 'company', profileData);
  };

  // Computed properties
  const isAuthenticated = !!user && !!localStorage.getItem('access_token');
  const availableProfiles = user?.available_profiles?.filter(Boolean) || []; // Filter out null/undefined values
  const currentProfile = user?.current_profile || availableProfiles.find((p: Profile) => p.is_current) || null;
  const hasCompanyProfiles = availableProfiles.some((p: Profile) => p.type === 'company');
  const hasVendorProfiles = availableProfiles.some((p: Profile) => p.type === 'vendor');
  const needsProfileSetup = user ? availableProfiles.length === 0 : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        logoutAll,
        setToken,
        setPassword,
        refreshTokens,
        loginWithGoogle,
        signupWithGoogle,
        handleOAuthCallback,
        checkAuth,
        fetchFreshUserData,
        handleAuthError,
        createCompanyProfile,
        createVendorProfile,
        updateProfile,
        switchProfile,
        switchToProfileType,
        getAvailableProfiles,
        checkCompanyProfile,
        checkVendorProfile,
        currentProfile,
        availableProfiles,
        hasCompanyProfiles,
        hasVendorProfiles,
        needsProfileSetup,
        updateVendorProfile,
        updateCompanyProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
