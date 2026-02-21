import httpClient from './httpClient';
import type { AxiosResponse } from 'axios';
import type { 
  Listing, 
  Quote, 
  CreateListingData, 
  CreateQuoteData, 
  UpdateQuoteData,
  ReviewQuoteData,
  ListingFilters,
  QuoteFilters,
  PaginatedResponse,
  ApiResponse
} from '../types/listings';

class ListingService {
  // Listing CRUD operations
  async getListings(filters?: ListingFilters, page = 1): Promise<AxiosResponse<PaginatedResponse<Listing>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    params.append('page', String(page));
    
    return httpClient.get<PaginatedResponse<Listing>>(`/api/listings?${params.toString()}`);
  }

  async getListing(id: number): Promise<AxiosResponse<Listing>> {
    return httpClient.get<Listing>(`/api/listings/${id}`);
  }

  async createListing(data: CreateListingData): Promise<AxiosResponse<Listing>> {
    return httpClient.post<Listing>('/api/listings', data);
  }

  async updateListing(id: number, data: Partial<CreateListingData>): Promise<AxiosResponse<Listing>> {
    return httpClient.put<Listing>(`/api/listings/${id}`, data);
  }

  async deleteListing(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return httpClient.delete<ApiResponse<void>>(`/api/listings/${id}`);
  }

  // Access management for private listings
  async grantAccess(listingId: number, vendorUserIds: number[]): Promise<AxiosResponse<ApiResponse<void>>> {
    return httpClient.post<ApiResponse<void>>(`/api/listings/${listingId}/grant-access`, {
      vendor_user_ids: vendorUserIds
    });
  }

  async revokeAccess(listingId: number, vendorUserIds: number[]): Promise<AxiosResponse<ApiResponse<void>>> {
    return httpClient.post<ApiResponse<void>>(`/api/listings/${listingId}/revoke-access`, {
      vendor_user_ids: vendorUserIds
    });
  }

  // Quote operations
  async getQuotes(filters?: QuoteFilters, page = 1): Promise<AxiosResponse<PaginatedResponse<Quote>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    params.append('page', String(page));
    
    return httpClient.get<PaginatedResponse<Quote>>(`/api/quotes?${params.toString()}`);
  }

  async getQuote(id: number): Promise<AxiosResponse<Quote>> {
    return httpClient.get<Quote>(`/api/quotes/${id}`);
  }

  async createQuote(data: CreateQuoteData): Promise<AxiosResponse<Quote>> {
    return httpClient.post<Quote>('/api/quotes', data);
  }

  async updateQuote(id: number, data: UpdateQuoteData): Promise<AxiosResponse<Quote>> {
    return httpClient.put<Quote>(`/api/quotes/${id}`, data);
  }

  async withdrawQuote(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return httpClient.patch<ApiResponse<void>>(`/api/quotes/${id}/withdraw`);
  }

  async reviewQuote(id: number, data: ReviewQuoteData): Promise<AxiosResponse<Quote>> {
    return httpClient.patch<Quote>(`/api/quotes/${id}/review`, data);
  }

  // Get quotes for a specific listing (company view)
  async getQuotesForListing(listingId: number): Promise<AxiosResponse<Quote[]>> {
    return httpClient.get<Quote[]>(`/api/listings/${listingId}/quotes`);
  }
}

export default new ListingService();
