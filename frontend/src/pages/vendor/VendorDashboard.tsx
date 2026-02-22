import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import listingService from '../../services/listingService';
import connectionService from '../../services/connectionService';
import type { Listing } from '../../types/listings';
import type { VendorCompanyConnection } from '../../types/connections';

const VendorDashboard: React.FC = () => {
  const { user, currentProfile } = useAuth();
  const vendorProfile = currentProfile?.type === 'vendor' ? currentProfile : null;
  const [availableListings, setAvailableListings] = useState<Listing[]>([]);
  const [associatedCompanies, setAssociatedCompanies] = useState<VendorCompanyConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeBids: 0,
    totalCompanies: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [listingsRes, quotesRes, connectionsRes] = await Promise.all([
          listingService.getListings({ status: 'active' }, 1),
          listingService.getQuotes({ status: 'submitted' }, 1),
          connectionService.getConnections()
        ]);

        const listings: Listing[] = listingsRes.data.data;
        const connections: VendorCompanyConnection[] = connectionsRes.connections || [];

        setAvailableListings(listings);
        setAssociatedCompanies(connections);
        setStats({
          totalListings: listingsRes.data.total,
          activeBids: quotesRes.data.total,
          totalCompanies: connections.length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Welcome Section */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h1 className="text-3xl font-black text-white mb-3">Welcome, <span className="text-emerald-500">{vendorProfile?.vendor_name || vendorProfile?.name}</span></h1>
              <p className="text-gray-400 font-medium">
                Synchronizing available listings and managing professional connections.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-premium">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Node Status</p>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                  <span className="text-white text-xs font-black uppercase tracking-[0.2em]">Active Protocol</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Available Listings</p>
                <p className="text-white text-3xl font-black">{stats.totalListings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Your Active Bids</p>
                <p className="text-white text-3xl font-black">{stats.activeBids}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Connections</p>
                <p className="text-white text-3xl font-black">{stats.totalCompanies}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to={ROUTES.PROTECTED.VENDOR.LISTINGS} className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-[32px] shadow-glow-indigo transition-all hover:scale-[1.02] active:scale-95">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-white font-black uppercase tracking-[0.25em] text-sm">Browse Protocol</span>
            </div>
          </Link>

          <Link to={ROUTES.PROTECTED.VENDOR.QUOTES} className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 rounded-[32px] shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-95">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-white font-black uppercase tracking-[0.25em] text-sm">Active Bids</span>
            </div>
          </Link>

          <Link to={ROUTES.PROTECTED.VENDOR.COMPANIES} className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 p-8 rounded-[32px] shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all hover:scale-[1.02] active:scale-95">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-white font-black uppercase tracking-[0.25em] text-sm">Network Mgmt</span>
            </div>
          </Link>
        </div>

        {/* Global Protocol Nodes */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] px-2 border-l-2 border-indigo-500 ml-[-2px]">Local Protocol Mesh</h2>
            <Link to={ROUTES.PROTECTED.VENDOR.LISTINGS} className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">See Full Network →</Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-md shadow-premium">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : availableListings.length === 0 ? (
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-16 text-center shadow-premium relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
              <div className="relative z-10">
                <p className="text-gray-500 font-bold mb-8 uppercase tracking-[0.1em]">No secure protocol signals detected in the immediate sector.</p>
                <Link to={ROUTES.PROTECTED.VENDOR.COMPANIES} className="inline-block bg-white/10 hover:bg-white/20 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-white/10">
                  Expand Signal Range
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {availableListings.map((listing) => {
                const bidSubmitted = listing.quotes?.some((q: { vendor_user_id: number }) => q.vendor_user_id === user?.id) ?? false;
                return (
                  <div
                    key={listing.id}
                    className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 hover:bg-white/[0.08] transition-all shadow-premium group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                      <div className="space-y-5">
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black text-indigo-400 uppercase tracking-widest">{listing.category}</span>
                          {listing.visibility === 'private' && <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] font-black text-red-400 uppercase tracking-widest">Restricted</span>}
                        </div>
                        <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors leading-tight">{listing.title}</h3>
                        <div className="flex flex-wrap items-center gap-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-white shadow-inner">
                              {listing.company?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white text-xs font-black uppercase tracking-widest mb-1">{listing.company?.name}</p>
                              <p className="text-gray-500 text-[10px] font-bold font-mono">NODE_HASH: {listing.company?.share_id}</p>
                            </div>
                          </div>
                          {listing.base_price != null && (
                            <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-3">Valuation</span>
                              <span className="text-emerald-500 font-black text-lg">${listing.base_price.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end gap-5">
                        <div className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 border backdrop-blur-md ${bidSubmitted
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}>
                          <div className={`h-2.5 w-2.5 rounded-full ${bidSubmitted ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]' : 'bg-yellow-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                            }`} />
                          {bidSubmitted ? 'Protocol Injection Active' : 'Uplink Pending'}
                        </div>
                        <Link
                          to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', listing.id.toString())}
                          className={`w-full md:w-auto px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all text-center flex items-center justify-center gap-4 group/btn ${bidSubmitted
                            ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                            : 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-glow-indigo hover:scale-105 hover:shadow-glow-primary'
                            }`}
                        >
                          {bidSubmitted ? 'Analyze Uplink' : 'Initialize Transmit'}
                          <svg className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link
                        to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', listing.id.toString())}
                        className={`${bidSubmitted
                          ? 'bg-blue-700 hover:bg-blue-600'
                          : 'bg-green-700 hover:bg-green-600'
                          } text-white px-4 py-2 rounded-md shadow-md shadow-blue-950/20 transition-colors flex items-center text-sm font-medium`}
                      >
                        {bidSubmitted ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Listing
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Submit Quote
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Peer Connections */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] px-2 border-l-2 border-emerald-500 ml-[-2px]">Verified Peer Nodes</h2>
            <Link to={ROUTES.PROTECTED.VENDOR.COMPANIES} className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Audit Mesh →</Link>
          </div>

          {associatedCompanies.length === 0 ? (
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-16 text-center shadow-premium relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
              <div className="relative z-10">
                <p className="text-gray-500 font-bold mb-8 uppercase tracking-[0.1em]">No verified peer signatures detected.</p>
                <Link to={ROUTES.PROTECTED.VENDOR.COMPANIES} className="inline-block bg-white/10 hover:bg-white/20 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-white/10">
                  Search Protocol
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {associatedCompanies.slice(0, 3).map((connection) => {
                const companyName = connection.company?.company_profile?.company_name || (connection.company as any)?.name || connection.company_share_id;
                return (
                  <div
                    key={connection.id}
                    className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 hover:bg-white/[0.08] transition-all shadow-premium group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl font-black text-white group-hover:scale-110 transition-all shadow-inner">
                          {companyName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-black text-sm tracking-tight mb-1">{companyName}</h3>
                          <p className="text-emerald-500 text-[10px] font-black font-mono tracking-widest">{connection.company_share_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Signal Established</span>
                        <span className="text-gray-300 text-[10px] font-bold font-mono">{new Date(connection.connected_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {associatedCompanies.length > 3 && (
                <Link
                  to={ROUTES.PROTECTED.VENDOR.COMPANIES}
                  className="bg-white/5 border border-white/10 border-dashed backdrop-blur-md rounded-[32px] p-8 flex flex-col items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all shadow-premium group"
                >
                  <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-90 transition-all">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] group-hover:text-white transition-colors">Expand Mesh View</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
