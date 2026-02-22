// Types for the Listings and Quotes system

interface User {
  id: number;
  email: string;
  name: string;
  current_profile_type: 'company' | 'vendor' | null;
  current_profile_id: number | null;
}

interface Company {
  id: number;
  name: string;
  share_id: string;
  description?: string;
  industry?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: number;
  listing_number: string;
  company_id: number;
  title: string;
  description: string;
  category: string;
  base_price?: number;
  visibility: 'public' | 'private';
  requirements?: string[];
  specifications?: string[];
  opens_at?: string;
  closes_at?: string;
  status: 'draft' | 'active' | 'closed' | 'cancelled';
  created_by: number;
  blockchain_enabled: boolean;
  blockchain_tx_hash?: string;
  created_at: string;
  updated_at: string;

  // Relationships
  company: Company;
  created_by_user: User;
  quotes?: Quote[];
  accessible_vendors?: User[];
}

export interface Quote {
  id: number;
  quote_number: string;
  listing_id: number;
  vendor_user_id: number;
  quoted_price: number;
  proposal_details: string;
  line_items?: LineItem[];
  delivery_days: number;
  terms_and_conditions?: string;
  attachments?: string[];
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  submitted_at: string;
  expires_at?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  blockchain_tx_hash?: string;
  created_at: string;
  updated_at: string;

  // Relationships
  listing: Listing;
  vendor: User;
  reviewed_by_user?: User;
}

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications?: string;
}

export interface ListingFilters {
  status?: string;
  category?: string;
  visibility?: 'public' | 'private';
}

export interface QuoteFilters {
  status?: string;
  listing_id?: number;
}

export interface CreateListingData {
  title: string;
  description: string;
  category: string;
  base_price?: number;
  visibility: 'public' | 'private';
  requirements?: string[];
  specifications?: string[];
  opens_at?: string;
  closes_at?: string;
  blockchain_enabled?: boolean;
  accessible_vendor_ids?: number[];
}

export interface CreateQuoteData {
  listing_id: number;
  quoted_price: number;
  proposal_details: string;
  line_items?: LineItem[];
  delivery_days: number;
  terms_and_conditions?: string;
  attachments?: string[];
  expires_at?: string;
}

export interface UpdateQuoteData extends Partial<Omit<CreateQuoteData, 'listing_id'>> { }

export interface ReviewQuoteData {
  status: 'under_review' | 'accepted' | 'rejected';
  review_notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Form state types
export interface ListingFormData extends CreateListingData {
  errors?: Record<string, string[]>;
}

export interface QuoteFormData extends CreateQuoteData {
  errors?: Record<string, string[]>;
}
