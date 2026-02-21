import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaTimes, FaPaperPlane, FaBan, FaTrashAlt } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import connectionService from '../../services/connectionService';
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
      const [requestsResponse, connectionsResponse] = await Promise.all([
        connectionService.getVendorRequests(),
        connectionService.getConnections()
      ]);

      setRequests(requestsResponse.requests || []);
      setConnections(connectionsResponse.connections || []);
    } catch (error) {
      console.error('Failed to synchronize mesh data:', error);
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
      console.error('Protocol transmission failure:', error);
      alert(error.response?.data?.message || 'Failed to initialize connection request');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('Are you sure you want to terminate this pending transmission?')) return;

    try {
      await connectionService.cancelRequest(requestId);
      await loadData(); // Reload data
    } catch (error: any) {
      console.error('Termination failure:', error);
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
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-12 border-b border-white/5">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase leading-tight">
              Network <span className="text-emerald-500">Topology</span>
            </h1>
            <p className="text-gray-400 font-medium whitespace-nowrap">Manage verified peer nodes and procurement uplinks</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto">
            <div className="relative w-full md:w-80 group">
              <input
                type="text"
                placeholder="Search Registry..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full py-4 pl-12 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <button
              onClick={() => setShowRequestForm(true)}
              className="w-full md:w-auto px-10 py-5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-glow-indigo hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <FaPlus className="text-[8px]" /> Initialize Uplink
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 shadow-glow-primary"></div>
            <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em] animate-pulse">Syncing Mesh Network...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Active Peers Matrix */}
            <div className="space-y-8">
              <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] px-3 border-l-2 border-emerald-500 ml-1">Verified Peer Matrix</h2>

              {filteredConnections.length === 0 ? (
                <div className="bg-white/2 border border-white/5 rounded-[32px] p-20 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/2 to-transparent opacity-50" />
                  <div className="relative z-10 opacity-30">
                    <FaBan className="text-5xl mx-auto mb-6 text-gray-500" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No Active Peer Nodes Detected</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] overflow-hidden shadow-premium relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50" />
                  <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Entity Signal</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Mesh Identifier</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Established</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Auth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/2">
                        {filteredConnections.map(connection => (
                          <tr key={connection.id} className="group hover:bg-white/[0.03] transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-xs shadow-inner">
                                  {connection.company?.company_profile?.company_name?.[0] || 'U'}
                                </div>
                                <span className="text-white font-bold uppercase text-xs tracking-wider">
                                  {connection.company?.company_profile?.company_name || 'Restricted Profile'}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-gray-400 font-black font-mono text-[10px] uppercase tracking-tighter">
                              {connection.company_share_id}
                            </td>
                            <td className="px-8 py-6 text-gray-500 font-bold text-[10px] uppercase">
                              {new Date(connection.connected_at).toLocaleDateString()}
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-gray-600 font-bold text-[10px] uppercase">{connection.last_accessed_at ? new Date(connection.last_accessed_at).toLocaleDateString() : 'Initial Sync Only'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Transmission Log (Requests) */}
            <div className="space-y-8">
              <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] px-3 border-l-2 border-indigo-500 ml-1">Outbound Uplink Log</h2>

              {filteredRequests.length === 0 ? (
                <div className="bg-white/2 border border-white/5 rounded-[32px] p-24 text-center opacity-40">
                  <FaPaperPlane className="text-4xl mx-auto mb-6 text-gray-600" />
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">No Uplink Transmissions Active</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredRequests.map(request => (
                    <div key={request.id} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />
                      <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${request.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                            request.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                              'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${request.status === 'pending' ? 'bg-amber-500 shadow-glow-amber scale-110' :
                              request.status === 'approved' ? 'bg-emerald-500 shadow-glow-primary' : 'bg-red-500'
                              }`} />
                            {request.status}
                          </div>
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleCancelRequest(request.id)}
                              className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                              title="Terminate Uplink"
                            >
                              <FaTrashAlt className="text-xs" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Mesh</p>
                          <h4 className="text-white font-black uppercase text-sm tracking-widest leading-tight">
                            {request.company?.company_profile?.company_name || 'PENDING_RESOLVE'}
                          </h4>
                          <p className="text-indigo-400 font-mono text-[9px] font-bold tracking-tighter opacity-60">ID://{request.company_share_id}</p>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Protocol Date</span>
                          <span className="text-gray-400 font-bold text-[10px]">{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Protocol Uplink */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 rounded-[40px] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden ring-1 ring-white/5">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <button
                onClick={() => setShowRequestForm(false)}
                className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>

              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Sync New <span className="text-indigo-500">Peer Node</span></h3>
                  <p className="text-gray-500 font-medium text-sm">Initialize a secure procurement link via shared registry hash.</p>
                </div>

                <form onSubmit={handleSendRequest} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Registry Hash (Share ID) *</label>
                    <input
                      type="text"
                      value={shareId}
                      onChange={e => setShareId(e.target.value)}
                      placeholder="ENTER_REGISTRY_HASH"
                      className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-black font-mono tracking-tighter"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Protocol Message (Optional)</label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Identify your node or purpose..."
                      rows={4}
                      className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium leading-relaxed"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={formLoading || !shareId.trim()}
                      className="flex-1 py-5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-glow-indigo hover:scale-[1.02] disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {formLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <FaPaperPlane className="text-[8px]" />
                      )}
                      Authorize Uplink
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="px-10 py-5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all"
                    >
                      Abort
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageCompanies;
