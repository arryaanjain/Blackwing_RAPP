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
    request.vendor?.vendor_profile?.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
    request.message?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConnections = connections.filter(connection =>
    connection.vendor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    connection.vendor?.vendor_profile?.vendor_name?.toLowerCase().includes(search.toLowerCase())
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
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Network <span className="text-indigo-500">Terminals</span></h1>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mt-2 ml-1">Manage and verify secure vendor connections</p>
          </div>

          <div className="flex p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-glass">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests'
                  ? 'bg-indigo-600 text-white shadow-glow-primary'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
              Requests ({requests.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'connections'
                  ? 'bg-indigo-600 text-white shadow-glow-primary'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
              Active ({connections.filter(c => c.is_active).length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <input
            type="text"
            placeholder={`Search ${activeTab === 'requests' ? 'protocol requests' : 'active terminals'}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full py-5 pl-14 pr-6 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
          />
          <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
        </div>

        {loading ? (
          <div className="text-center py-24 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md animate-pulse">
            <div className="inline-block h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em] mt-6">Establishing Data Link...</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            {activeTab === 'requests' ? (
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl text-gray-600 font-medium">
                    {search ? 'No data packets match current search query.' : 'No pending connection requests on current block.'}
                  </div>
                ) : (
                  filteredRequests.map(request => (
                    <div key={request.id} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/[0.07] transition-all group relative overflow-hidden shadow-glass">
                      <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                              {request.vendor?.vendor_profile?.vendor_name || request.vendor?.name || 'Unknown Terminal'}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : getStatusBadge(request.status)
                              }`}>
                              {request.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-6">
                            <div>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Specialization</p>
                              <p className="text-white font-medium">{request.vendor_profile_data?.specialization || 'General Protocol'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Base Location</p>
                              <p className="text-white font-medium">{request.vendor_profile_data?.location || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Identity Vector</p>
                              <p className="text-indigo-400 font-medium">{request.vendor_profile_data?.contact_email || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Request Timestamp</p>
                              <p className="text-white font-medium">{formatDate(request.created_at)}</p>
                            </div>
                          </div>

                          {request.message && (
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 border-l-Indigo-500/50">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Protocol Message</p>
                              <p className="text-gray-300 text-sm leading-relaxed italic">"{request.message}"</p>
                            </div>
                          )}
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex lg:flex-col gap-3">
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="px-8 py-3 bg-white/5 hover:bg-indigo-600 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-glow-primary active:scale-95 group/btn"
                            >
                              <div className="flex items-center gap-2">
                                <FaCheck className="text-emerald-500 group-hover/btn:text-white" /> Verify Access
                              </div>
                            </button>
                            <button
                              onClick={() => handleDenyRequest(request.id)}
                              className="px-8 py-3 bg-white/5 hover:bg-red-600/20 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:border-red-500/50 active:scale-95 group/btn"
                            >
                              <div className="flex items-center gap-2">
                                <FaTimes className="text-red-500 group-hover/btn:text-white" /> Block Node
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-glass">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Active Terminal</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Field</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Location</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Verified Since</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Last Sync</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredConnections.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-8 py-20 text-center text-gray-600 font-medium">
                            {search ? 'Search parameters returned zero node results.' : 'No active terminal connections established.'}
                          </td>
                        </tr>
                      ) : (
                        filteredConnections.map(connection => (
                          <tr key={connection.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="px-8 py-6">
                              <div>
                                <p className="text-white font-black uppercase tracking-tighter text-lg group-hover:text-indigo-400 transition-colors">
                                  {connection.vendor?.vendor_profile?.vendor_name || connection.vendor?.name || 'Unknown'}
                                </p>
                                <p className="text-gray-500 text-xs font-medium">{connection.vendor?.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-6 font-medium text-gray-400">
                              {connection.vendor?.vendor_profile?.specialization || 'General'}
                            </td>
                            <td className="px-6 py-6 font-medium text-gray-400">
                              {connection.vendor?.vendor_profile?.location || 'Unknown'}
                            </td>
                            <td className="px-6 py-6 font-medium text-indigo-400 text-xs tracking-wider uppercase">
                              {formatDate(connection.connected_at)}
                            </td>
                            <td className="px-6 py-6 font-medium text-gray-500 text-xs uppercase">
                              {connection.last_accessed_at ? formatDate(connection.last_accessed_at) : 'NEVER'}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button
                                onClick={() => handleRevokeConnection(connection.id)}
                                className="p-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/10 rounded-xl transition-all shadow-glow-indigo active:scale-95"
                                title="Revoke Protocol Access"
                              >
                                <FaTrashAlt className="text-sm" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageVendors;
