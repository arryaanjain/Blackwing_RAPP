import httpClient from './httpClient';
import type { 
  VendorCompanyConnection,
  ConnectionRequestForm,
  ReviewRequestForm,
  RevokeConnectionForm,
  ConnectionRequestResponse,
  ConnectionsResponse,
  RequestsResponse
} from '../types/connections';

class ConnectionService {
  /**
   * Vendor APIs
   */
  
  // Send connection request to company
  async sendConnectionRequest(data: ConnectionRequestForm): Promise<ConnectionRequestResponse> {
    const response = await httpClient.post('/api/connections/request', data);
    return response.data;
  }
  
  // Get vendor's sent requests
  async getVendorRequests(): Promise<RequestsResponse> {
    const response = await httpClient.get('/api/connections/requests/sent');
    return response.data;
  }
  
  // Cancel a pending request
  async cancelRequest(requestId: number): Promise<ConnectionRequestResponse> {
    const response = await httpClient.patch(`/api/connections/requests/${requestId}/cancel`);
    return response.data;
  }
  
  /**
   * Company APIs
   */
  
  // Get company's received requests
  async getCompanyRequests(): Promise<RequestsResponse> {
    const response = await httpClient.get('/api/connections/requests/received');
    return response.data;
  }
  
  // Approve a connection request
  async approveRequest(requestId: number, data?: ReviewRequestForm): Promise<ConnectionRequestResponse> {
    const response = await httpClient.patch(`/api/connections/requests/${requestId}/approve`, data || {});
    return response.data;
  }
  
  // Deny a connection request
  async denyRequest(requestId: number, data?: ReviewRequestForm): Promise<ConnectionRequestResponse> {
    const response = await httpClient.patch(`/api/connections/requests/${requestId}/deny`, data || {});
    return response.data;
  }
  
  /**
   * Shared APIs
   */
  
  // Get active connections for current user
  async getConnections(): Promise<ConnectionsResponse> {
    const response = await httpClient.get('/api/connections');
    return response.data;
  }
  
  // Revoke a connection (company only)
  async revokeConnection(connectionId: number, data?: RevokeConnectionForm): Promise<{ message: string; connection: VendorCompanyConnection }> {
    const response = await httpClient.patch(`/api/connections/${connectionId}/revoke`, data || {});
    return response.data;
  }
}

export default new ConnectionService();
