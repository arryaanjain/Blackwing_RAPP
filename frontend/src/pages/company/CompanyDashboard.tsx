import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import listingService from '../../services/listingService';
import connectionService from '../../services/connectionService';
import type { Listing } from '../../types/listings';

const CompanyDashboard: React.FC = () => {
  const { currentProfile } = useAuth();
  const companyProfile = currentProfile?.type === 'company' ? currentProfile : null;
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [pendingVendorRequests, setPendingVendorRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeBids: 0,
    totalVendors: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [allListingsRes, activeListingsRes, connectionsRes, requestsRes] = await Promise.all([
          listingService.getListings({}, 1),                    // All listings — for total count
          listingService.getListings({ status: 'active' }, 1), // Active listings — for display
          connectionService.getConnections(),                   // Connected vendors count
          connectionService.getCompanyRequests()                // Pending vendor requests
        ]);

        const allListings = allListingsRes.data;
        const activeListingsData = activeListingsRes.data;

        setActiveListings(activeListingsData.data);

        // Count all quotes across active listings (active bids)
        const totalActiveBids = activeListingsData.data.reduce(
          (sum, listing) => sum + (listing.quotes?.length || 0), 0
        );

        // Count pending connection requests
        const pendingCount = (requestsRes as any).requests?.filter(
          (req: any) => req.status === 'pending'
        ).length || 0;

        setPendingVendorRequests(pendingCount);
        setStats({
          totalListings: allListings.total,
          activeBids: totalActiveBids,
          totalVendors: (connectionsRes as any).connections?.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Welcome, <span className="text-shimmer">{companyProfile?.company_name || companyProfile?.name}</span></h1>
          <p className="text-gray-400 font-medium max-w-2xl">
            Protocol ID: <span className="text-indigo-400 font-black tracking-widest ml-2">{companyProfile?.id}</span>. Share this identity with vendors to establish encrypted trade connections on the RAPP network.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 relative group overflow-hidden shadow-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
            <div className="flex items-center relative z-10">
              <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform shadow-glow-indigo">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Listings</p>
                <p className="text-white text-3xl font-black tracking-tighter">{stats.totalListings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 relative group overflow-hidden shadow-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
            <div className="flex items-center relative z-10">
              <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Bids</p>
                <p className="text-white text-3xl font-black tracking-tighter">{stats.activeBids}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 relative group overflow-hidden shadow-glass">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
            <div className="flex items-center relative z-10">
              <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Connected Vendors</p>
                <p className="text-white text-3xl font-black tracking-tighter">{stats.totalVendors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS_CREATE} className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-center shadow-lg transition-all hover:scale-[1.02] hover:shadow-glow-primary active:scale-[0.98]">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Create New Listing</span>
            </div>
          </Link>

          <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS} className="group relative overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-center transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]">
            <div className="relative z-10 flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Manage Listings</span>
            </div>
          </Link>

          <Link to={ROUTES.PROTECTED.COMPANY.VENDORS} className="group relative overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-center transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]">
            {pendingVendorRequests > 0 && (
              <div className="absolute top-4 right-4 bg-indigo-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingVendorRequests} NEW
              </div>
            )}
            <div className="relative z-10 flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Network Terminals</span>
            </div>
          </Link>
        </div>

        {/* Active Listings */}
        <div>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Active Protocols</h2>
            <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS} className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">View All Archive →</Link>
          </div>

          {loading ? (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center animate-pulse">
              <p className="text-indigo-400 font-black uppercase text-xs tracking-widest">Synchronizing Data Streams...</p>
            </div>
          ) : activeListings.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
              <p className="text-gray-500 font-medium mb-6">No active listings identified on the current node.</p>
              <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS_CREATE} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                Initialize Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeListings.map((listing: Listing) => (
                <div
                  key={listing.id}
                  className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/10 transition-all group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors" />
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">{listing.title}</h3>
                      <p className="text-gray-400 text-sm font-medium line-clamp-1 max-w-xl">{listing.description}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        {listing.base_price && (
                          <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-white/5">
                            Max: ${listing.base_price.toLocaleString()}
                          </div>
                        )}
                        <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/5">
                          {listing.category}
                        </div>
                        <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-white/5 flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                          {listing.visibility}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 flex flex-col md:items-end">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Incoming Quotes</div>
                      <div className="text-3xl font-black text-white tracking-tighter">{listing.quotes?.length || 0}</div>
                      <div className="text-[10px] font-bold text-indigo-400 mt-2">
                        Ends: {formatDate(listing.closes_at)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS_DETAIL.replace(':id', listing.id.toString())} className="text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      Access Terminal Details <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
