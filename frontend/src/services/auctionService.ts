import httpClient from './httpClient';
import type { AxiosResponse } from 'axios';
import type {
  Auction,
  LeaderboardData,
  VendorRankData,
  CreateAuctionData,
} from '../types/auction';

class AuctionService {
  /** POST /api/auctions — create + auto-start auction for a listing */
  async createAuction(data: CreateAuctionData): Promise<AxiosResponse<{ auction: Auction }>> {
    return httpClient.post('/api/auctions', data);
  }

  /** GET /api/auctions/{id} — single auction (buyer or participant) */
  async getAuction(id: number): Promise<AxiosResponse<{ auction: Auction }>> {
    return httpClient.get(`/api/auctions/${id}`);
  }

  /** GET /api/auctions/my — auctions the vendor is enrolled in */
  async getMyAuctions(): Promise<AxiosResponse<{ auctions: Auction[] }>> {
    return httpClient.get('/api/auctions/my');
  }

  /** GET /api/auctions/company — auctions the company created */
  async getCompanyAuctions(): Promise<AxiosResponse<{ auctions: Auction[] }>> {
    return httpClient.get('/api/auctions/company');
  }

  /** GET /api/auctions/{id}/receipt — chronological tx hash receipt */
  async getReceipt(auctionId: number): Promise<AxiosResponse<any>> {
    return httpClient.get(`/api/auctions/${auctionId}/receipt`);
  }

  /** GET /api/listings/{listingId}/auction — latest auction for a listing */
  async getAuctionForListing(listingId: number): Promise<AxiosResponse<{ auction: Auction | null }>> {
    return httpClient.get(`/api/listings/${listingId}/auction`);
  }

  /** GET /api/auctions/{id}/leaderboard — top vendors (buyer only) */
  async getLeaderboard(auctionId: number): Promise<AxiosResponse<LeaderboardData>> {
    return httpClient.get(`/api/auctions/${auctionId}/leaderboard`);
  }

  /** GET /api/auctions/{id}/my-rank — vendor's own rank */
  async getMyRank(auctionId: number): Promise<AxiosResponse<VendorRankData>> {
    return httpClient.get(`/api/auctions/${auctionId}/my-rank`);
  }

  /** POST /api/auctions/{id}/bid — place a bid */
  async placeBid(auctionId: number, bidAmount: number): Promise<AxiosResponse<any>> {
    return httpClient.post(`/api/auctions/${auctionId}/bid`, { bid_amount: bidAmount });
  }

  /** POST /api/auctions/{id}/end — manually end auction (buyer only) */
  async endAuction(auctionId: number): Promise<AxiosResponse<any>> {
    return httpClient.post(`/api/auctions/${auctionId}/end`);
  }

  /** GET /api/auctions/{id}/my-bids — vendor's bid history for this auction */
  async getMyBids(auctionId: number): Promise<AxiosResponse<any>> {
    return httpClient.get(`/api/auctions/${auctionId}/my-bids`);
  }
}

export default new AuctionService();

