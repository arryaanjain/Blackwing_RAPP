import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaTimes, FaPaperPlane, FaHourglass, FaCheck, FaBan, FaTrashAlt } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import connectionService from '../../services/connectionService';
import httpClient from '../../services/httpClient';
import type { VendorCompanyConnectionRequest, VendorCompanyConnection } from '../../types/connections';

const ManageCompanies: React.FC = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<VendorCompanyConnectionRequest[]>([]);
  const [connections, setConnections] = useState<VendorCompanyConnection[]>([]);
  
  // Form state
  const [shareId, setShareId] = useState('');
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // DEBUG: Test health endpoints first
      console.log('🔍 DEBUGGING: Testing health endpoints...');
      
      try {
        const healthResponse = await httpClient.healthCheck();
        console.log('✅ Health check (no auth):', healthResponse.data);
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }

      try {
        const authHealthResponse = await httpClient.authHealthCheck();
        console.log('✅ Auth health check:', authHealthResponse.data);
      } catch (error) {
        console.error('❌ Auth health check failed:', error);
      }

      try {
        const debugResponse = await httpClient.debugConnection();
        console.log('🔍 Connection debug check:', debugResponse.data);
      } catch (error) {
        console.error('❌ Connection debug failed:', error);
      }

      // Now try the actual connection service calls
      console.log('🔍 DEBUGGING: Testing connection service calls...');
      
      const [requestsResponse, connectionsResponse] = await Promise.all([
        connectionService.getVendorRequests(),
        connectionService.getConnections()
      ]);
      
      console.log('✅ Connection requests response:', requestsResponse);
      console.log('✅ Connections response:', connectionsResponse);
      
      setRequests(requestsResponse.requests || []);
      setConnections(connectionsResponse.connections || []);
    } catch (error) {
      console.error('❌ Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareId.trim()) return;

    setFormLoading(true);
    try {
      await connectionService.sendConnectionRequest({
        company_share_id: shareId.trim(),
        message: message.trim() || undefined
      });
      
      // Reset form and close modal
      setShareId('');
      setMessage('');
      setShowRequestForm(false);
      
      // Reload data to show new request
      await loadData();
    } catch (error: any) {
      console.error('Failed to send request:', error);
      alert(error.response?.data?.message || 'Failed to send connection request');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      await connectionService.cancelRequest(requestId);
      await loadData(); // Reload data
    } catch (error: any) {
      console.error('Failed to cancel request:', error);
      alert(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaHourglass className="text-yellow-400" />;
      case 'approved':
        return <FaCheck className="text-green-400" />;
      case 'denied':
        return <FaBan className="text-red-400" />;
      case 'cancelled':
        return <FaTimes className="text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-700 text-yellow-100';
      case 'approved':
        return 'bg-green-700 text-green-100';
      case 'denied':
        return 'bg-red-700 text-red-100';
      case 'cancelled':
        return 'bg-gray-700 text-gray-100';
      default:
        return 'bg-blue-700 text-blue-100';
    }
  };

  // Filter requests and connections based on search
  const filteredRequests = requests.filter(request =>
    request.company_share_id.toLowerCase().includes(search.toLowerCase()) ||
    request.company?.company_profile?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    request.status.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConnections = connections.filter(connection =>
    connection.company_share_id.toLowerCase().includes(search.toLowerCase()) ||
    connection.company?.company_profile?.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto bg-blue-900/40 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Manage Company Connections</h1>
        
        {/* Search and Add Button */}
        <div className="flex items-center mb-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search companies, share IDs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full py-2 pl-10 pr-4 rounded-lg bg-blue-800 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-2.5 text-blue-300" />
          </div>
          <button 
            onClick={() => setShowRequestForm(true)}
            className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium flex items-center gap-2 shadow hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            <FaPlus /> Send Request
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-blue-300 mt-4">Loading...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Connections */}
            {filteredConnections.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Active Connections</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-green-800/60">
                        <th className="px-4 py-3 text-green-200">Company</th>
                        <th className="px-4 py-3 text-green-200">Share ID</th>
                        <th className="px-4 py-3 text-green-200">Connected Since</th>
                        <th className="px-4 py-3 text-green-200">Last Accessed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConnections.map(connection => (
                        <tr key={connection.id} className="border-b border-green-800 hover:bg-green-800/30 transition-all">
                          <td className="px-4 py-3 text-white">
                            {connection.company?.company_profile?.company_name || 'Unknown Company'}
                          </td>
                          <td className="px-4 py-3 text-green-200 font-mono">{connection.company_share_id}</td>
                          <td className="px-4 py-3 text-green-200">
                            {new Date(connection.connected_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-green-200">
                            {connection.last_accessed_at 
                              ? new Date(connection.last_accessed_at).toLocaleDateString()
                              : 'Never'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Connection Requests */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Connection Requests</h2>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-blue-400">
                  No connection requests found. Send a request to connect with a company.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-800/60">
                        <th className="px-4 py-3 text-blue-200">Company</th>
                        <th className="px-4 py-3 text-blue-200">Share ID</th>
                        <th className="px-4 py-3 text-blue-200">Status</th>
                        <th className="px-4 py-3 text-blue-200">Sent Date</th>
                        <th className="px-4 py-3 text-blue-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map(request => (
                        <tr key={request.id} className="border-b border-blue-800 hover:bg-blue-800/30 transition-all">
                          <td className="px-4 py-3 text-white">
                            {request.company?.company_profile?.company_name || request.company_share_id}
                          </td>
                          <td className="px-4 py-3 text-blue-200 font-mono">{request.company_share_id}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-blue-200">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            {request.status === 'pending' && (
                              <button
                                onClick={() => handleCancelRequest(request.id)}
                                className="text-red-400 hover:text-red-600 transition-colors"
                                title="Cancel Request"
                              >
                                <FaTrashAlt />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-blue-900 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Send Connection Request</h3>
              <form onSubmit={handleSendRequest}>
                <div className="mb-4">
                  <label className="block text-blue-200 mb-2">Company Share ID *</label>
                  <input
                    type="text"
                    value={shareId}
                    onChange={e => setShareId(e.target.value)}
                    placeholder="Enter company share ID..."
                    className="w-full py-2 px-3 rounded-lg bg-blue-800 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-blue-200 mb-2">Message (Optional)</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    rows={3}
                    className="w-full py-2 px-3 rounded-lg bg-blue-800 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={formLoading || !shareId.trim()}
                    className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FaPaperPlane />
                    )}
                    Send Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageCompanies;
