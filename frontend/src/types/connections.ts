// Connection Request Types
export interface VendorCompanyConnectionRequest {
  id: number;
  vendor_user_id: number;
  company_share_id: string;
  company_user_id?: number;
  message?: string;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  vendor_profile_data?: {
    vendor_name: string;
    specialization: string;
    location: string;
    contact_email: string;
    business_description?: string;
  };
  expires_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  vendor?: User;
  company?: User;
  reviewer?: User;
}

// Connection Types
export interface VendorCompanyConnection {
  id: number;
  vendor_user_id: number;
  company_user_id: number;
  company_share_id: string;
  connected_at: string;
  approved_by: number;
  original_request_id?: number;
  is_active: boolean;
  permissions?: any;
  last_accessed_at?: string;
  revoked_by?: number;
  revoked_at?: string;
  revocation_reason?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  vendor?: User;
  company?: User;
  approver?: User;
  revoker?: User;
  originalRequest?: VendorCompanyConnectionRequest;
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'vendor' | 'company';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  
  // Profile relationships
  vendorProfile?: VendorProfile;
  companyProfile?: CompanyProfile;
}

export interface VendorProfile {
  id: number;
  user_id: number;
  vendor_name: string;
  specialization: string;
  location: string;
  contact_email: string;
  contact_phone?: string;
  business_description?: string;
  website?: string;
  blockchain_tx_hash?: string;
  blockchain_verified: boolean;
  blockchain_registered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: number;
  user_id: number;
  company_name: string;
  share_id: string;
  business_type: string;
  location: string;
  registration_number: string;
  incorporation_date: string;
  website?: string;
  contact_email: string;
  contact_phone?: string;
  business_description?: string;
  blockchain_tx_hash?: string;
  blockchain_verified: boolean;
  blockchain_registered_at?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}

export interface ConnectionRequestResponse extends ApiResponse {
  request?: VendorCompanyConnectionRequest;
}

export interface ConnectionsResponse extends ApiResponse {
  connections?: VendorCompanyConnection[];
}

export interface RequestsResponse extends ApiResponse {
  requests?: VendorCompanyConnectionRequest[];
}

// Form Types
export interface ConnectionRequestForm {
  company_share_id: string;
  message?: string;
}

export interface ReviewRequestForm {
  review_notes?: string;
}

export interface RevokeConnectionForm {
  reason?: string;
}
