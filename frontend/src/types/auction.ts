// Types for the Reverse Auction system

export interface Auction {
  id: number;
  listing_id: number;
  buyer_id: number;
  start_time: string;
  end_time: string;
  minimum_decrement_type: 'percent' | 'fixed';
  minimum_decrement_value: number;
  extension_window_seconds: number;
  extension_duration_seconds: number;
  status: 'scheduled' | 'running' | 'completed' | 'cancelled';
  blockchain_tx_hash?: string | null;
  receipt_tx_hash?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  vendor_id: number;
  vendor_name: string;
  current_best_bid: number;
}

export interface LeaderboardData {
  auction_id: number;
  status: string;
  time_remaining_sec: number;
  end_time: string;
  lowest_bid: number | null;
  leaderboard: LeaderboardEntry[];
}

export interface VendorRankData {
  auction_id: number;
  your_rank: number | null;
  your_best_bid: number | null;
  time_remaining_sec: number;
  end_time: string;
  status: string;
}

export interface CreateAuctionData {
  listing_id: number;
  duration_minutes: number;
  minimum_decrement_type: 'percent' | 'fixed';
  minimum_decrement_value: number;
}

