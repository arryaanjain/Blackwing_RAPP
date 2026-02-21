import React, { useState, useEffect } from 'react';
import { FaSearch, FaCheck, FaTimes, FaTrashAlt } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import connectionService from '../../services/connectionService';
import httpClient from '../../services/httpClient';
import type { VendorCompanyConnectionRequest, VendorCompanyConnection } from '../../types/connections';

const ManageVendors: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'connections'>('requests');
  const [requests, setRequests] = useState<VendorCompanyConnectionRequest[]>([]);
  const [connections, setConnections] = useState<VendorCompanyConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Load connection requests and active connections
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // DEBUG: Test health endpoints first
      console.log('🔍 DEBUGGING (Company): Testing health endpoints...');
      
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

      // Now try the actual connection service calls
      console.log('🔍 DEBUGGING (Company): Testing connection service calls...');
      
      if (activeTab === 'requests') {
        const response = await connectionService.getCompanyRequests();
        console.log('✅ Company requests response:', response);
        setRequests(response.requests || []);
      } else {
        const response = await connectionService.getConnections();
        console.log('✅ Connections response:', response);
        setConnections(response.connections || []);
      }
    } catch (error) {
      console.error('❌ Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number, notes?: string) => {
    try {
      await connectionService.approveRequest(requestId, { review_notes: notes });
      await loadData(); // Reload data
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleDenyRequest = async (requestId: number, notes?: string) => {
    try {
      await connectionService.denyRequest(requestId, { review_notes: notes });
      await loadData(); // Reload data
    } catch (error) {
      console.error('Failed to deny request:', error);
    }
  };

  const handleRevokeConnection = async (connectionId: number, reason?: string) => {
    try {
      await connectionService.revokeConnection(connectionId, { reason });
      await loadData(); // Reload data
    } catch (error) {
      console.error('Failed to revoke connection:', error);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.vendor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    request.vendor?.vendorProfile?.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
    request.message?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConnections = connections.filter(connection =>
    connection.vendor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    connection.vendor?.vendorProfile?.vendor_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-600 text-yellow-100',
      approved: 'bg-green-600 text-green-100',
      denied: 'bg-red-600 text-red-100',
      cancelled: 'bg-gray-600 text-gray-100'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-600 text-gray-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto bg-blue-900/40 rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Manage Vendors</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'requests'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-800 text-blue-300 hover:bg-blue-700'
              }`}
            >
              Connection Requests ({requests.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'connections'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-800 text-blue-300 hover:bg-blue-700'
              }`}
            >
              Active Connections ({connections.filter(c => c.is_active).length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder={`Search ${activeTab === 'requests' ? 'requests' : 'connections'}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full py-3 pl-10 pr-4 rounded-lg bg-blue-800 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3.5 text-blue-300" />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-blue-300 mt-4">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'requests' ? (
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 text-blue-400">
                    {search ? 'No requests found matching your search.' : 'No connection requests found.'}
                  </div>
                ) : (
                  filteredRequests.map(request => (
                    <div key={request.id} className="bg-blue-800/50 rounded-lg p-6 border border-blue-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">
                              {request.vendor?.vendorProfile?.vendor_name || request.vendor?.name || 'Unknown Vendor'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-blue-300 text-sm">Specialization</p>
                              <p className="text-white">{request.vendor_profile_data?.specialization || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-blue-300 text-sm">Location</p>
                              <p className="text-white">{request.vendor_profile_data?.location || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-blue-300 text-sm">Contact Email</p>
                              <p className="text-white">{request.vendor_profile_data?.contact_email || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-blue-300 text-sm">Requested On</p>
                              <p className="text-white">{formatDate(request.created_at)}</p>
                            </div>
                          </div>

                          {request.message && (
                            <div className="mb-4">
                              <p className="text-blue-300 text-sm mb-1">Message</p>
                              <p className="text-white bg-blue-900/50 p-3 rounded">{request.message}</p>
                            </div>
                          )}

                          {request.review_notes && (
                            <div className="mb-4">
                              <p className="text-blue-300 text-sm mb-1">Review Notes</p>
                              <p className="text-white bg-blue-900/50 p-3 rounded">{request.review_notes}</p>
                            </div>
                          )}
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              onClick={() => handleDenyRequest(request.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <FaTimes /> Deny
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-800/60">
                      <th className="px-4 py-3 text-blue-200">Vendor</th>
                      <th className="px-4 py-3 text-blue-200">Specialization</th>
                      <th className="px-4 py-3 text-blue-200">Location</th>
                      <th className="px-4 py-3 text-blue-200">Connected</th>
                      <th className="px-4 py-3 text-blue-200">Last Access</th>
                      <th className="px-4 py-3 text-blue-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConnections.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-blue-400">
                          {search ? 'No connections found matching your search.' : 'No active connections found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredConnections.map(connection => (
                        <tr key={connection.id} className="border-b border-blue-800 hover:bg-blue-800/30 transition-all">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-white font-medium">
                                {connection.vendor?.vendorProfile?.vendor_name || connection.vendor?.name || 'Unknown'}
                              </p>
                              <p className="text-blue-300 text-sm">{connection.vendor?.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-blue-200">
                            {connection.vendor?.vendorProfile?.specialization || 'Not specified'}
                          </td>
                          <td className="px-4 py-3 text-blue-200">
                            {connection.vendor?.vendorProfile?.location || 'Not specified'}
                          </td>
                          <td className="px-4 py-3 text-blue-200">
                            {formatDate(connection.connected_at)}
                          </td>
                          <td className="px-4 py-3 text-blue-200">
                            {connection.last_accessed_at ? formatDate(connection.last_accessed_at) : 'Never'}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleRevokeConnection(connection.id)}
                              className="text-red-400 hover:text-red-600 transition-colors mr-2"
                              title="Revoke Connection"
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageVendors;
