import httpClient from './httpClient';
import type { AxiosResponse } from 'axios';

export interface WalletBalance {
  balance: number;
  point_costs: {
    listing: number;
    quote: number;
    bid: number;
  };
}

export interface WalletTransaction {
  id: number;
  user_id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface PaginatedTransactions {
  data: WalletTransaction[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  points: number;
  user_name: string;
  user_email: string;
}

export interface VerifyPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  points: number;
}

export interface VerifyPaymentResponse {
  message: string;
  points_added: number;
  new_balance: number;
}

class WalletService {
  async getBalance(): Promise<AxiosResponse<WalletBalance>> {
    return httpClient.get<WalletBalance>('/api/wallet');
  }

  async getTransactions(page = 1): Promise<AxiosResponse<PaginatedTransactions>> {
    return httpClient.get<PaginatedTransactions>(`/api/wallet/transactions?page=${page}`);
  }

  async createOrder(amountInr: number, points: number): Promise<AxiosResponse<CreateOrderResponse>> {
    return httpClient.post<CreateOrderResponse>('/api/wallet/order', {
      amount_inr: amountInr,
      points,
    });
  }

  async verifyPayment(data: VerifyPaymentData): Promise<AxiosResponse<VerifyPaymentResponse>> {
    return httpClient.post<VerifyPaymentResponse>('/api/wallet/verify', data);
  }
}

const walletService = new WalletService();
export default walletService;

