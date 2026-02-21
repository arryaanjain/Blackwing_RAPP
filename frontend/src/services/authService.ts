import httpClient from './httpClient';
import type { AxiosResponse } from 'axios';

interface User {
  id: number;
  email: string;
  name: string;
  current_profile_type: 'company' | 'vendor' | null;
  current_profile_id: number | null;
}

interface SwitchProfileResponse {
  message: string;
  profile_type: 'company' | 'vendor';
  profile: {
    id: number;
    [key: string]: any;
  };
}

interface GstVerificationResponse {
  valid: boolean;
  message: string;
  data: {
    gstin: string;
    legal_name?: string;
    trade_name?: string;
    status?: string;
    registration_date?: string;
    state?: string;
    taxpayer_type?: string;
    verified_via?: string;
  } | null;
}

class AuthService {
  async switchProfile(profileType: 'company' | 'vendor'): Promise<AxiosResponse<SwitchProfileResponse>> {
    return httpClient.post<SwitchProfileResponse>('/api/profiles/switch', {
      profile_type: profileType
    });
  }

  async getCurrentUser(): Promise<AxiosResponse<{ user: User }>> {
    return httpClient.get<{ user: User }>('/api/auth/me');
  }

  async verifyGst(gstNumber: string): Promise<AxiosResponse<GstVerificationResponse>> {
    return httpClient.post<GstVerificationResponse>('/api/profiles/verify-gst', {
      gst_number: gstNumber
    });
  }
}

export default new AuthService();
