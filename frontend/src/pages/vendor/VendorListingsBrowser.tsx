import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import { ROUTES } from '../../config/routes';
import type { Listing, ListingFilters, PaginatedResponse } from '../../types/listings';
import { TxHashBadge } from '../../components/common/TxHashBadge';

const VendorListingsBrowser: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ListingFilters>({});

  useEffect(() => {
    loadListings();
  }, [currentPage, filters]);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingService.getListings(filters, currentPage);
      const data: PaginatedResponse<Listing> = response.data;

      setListings(data.data);
      setTotalPages(data.last_page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ListingFilters, value: any) => {
    setFilters((prev: ListingFilters) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/50 text-green-300';
      case 'draft': return 'bg-yellow-900/50 text-yellow-300';
      case 'closed': return 'bg-gray-900/50 text-gray-300';
      case 'cancelled': return 'bg-red-900/50 text-red-300';
      default: return 'bg-gray-900/50 text-gray-300';
    }
  };


  const isDeadlinePassed = (closesAt?: string) => {
    return closesAt && new Date(closesAt) <= new Date();
  };

  const canQuote = (listing: Listing) => {
    return listing.status === 'active' && !isDeadlinePassed(listing.closes_at);
  };

  if (user?.current_profile_type !== 'vendor') {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">Only vendors can browse listings. Please switch to a vendor profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <h1 className="text-4xl font-black text-white mb-4">GLOBAL <span className="text-indigo-500">LISTINGS</span></h1>
            <p className="text-gray-400 font-medium max-w-lg">Discover and secure protocol procurement opportunities across the decentralized mesh.</p>
          </div>
          <Link
            to={ROUTES.PROTECTED.VENDOR.QUOTES}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] hover:shadow-glow-primary active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Action Bids
            </span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Filters Panel */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-8 px-2 border-l-2 border-indigo-500">Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status Vector</label>
                <div className="relative">
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                  >
                    <option value="" className="bg-[#05070a]">All States</option>
                    <option value="active" className="bg-[#05070a]">Active Protocol</option>
                    <option value="closed" className="bg-[#05070a]">Archived</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Capability Matrix</label>
                <input
                  type="text"
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  placeholder="Enter category keyword..."
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({});
                    setCurrentPage(1);
                  }}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                >
                  Reset Protocol
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl backdrop-blur-md">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && listings.length === 0 && (
          <div className="flex items-center justify-center h-96 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-md shadow-premium">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]"></div>
          </div>
        )}

        {/* Listings Mesh */}
        <div className="grid gap-8">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden group hover:bg-white/[0.08] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                        {listing.category}
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border ${getStatusColor(listing.status)}`}>
                        <div className={`h-2 w-2 rounded-full ${listing.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                          listing.status === 'closed' ? 'bg-gray-500' : 'bg-red-500'
                          }`} />
                        {listing.status}
                      </div>
                      <span className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lg filter grayscale opacity-50">
                        {listing.visibility === 'public' ? '🌐' : '🔒'}
                      </span>
                      {listing.blockchain_tx_hash && (
                        <TxHashBadge hash={listing.blockchain_tx_hash} label="Listing On-chain" />
                      )}
                    </div>

                    <div>
                      <h2 className="text-3xl font-black text-white group-hover:text-indigo-400 transition-colors mb-4 tracking-tight">
                        <Link to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', listing.id.toString())}>
                          {listing.title}
                        </Link>
                      </h2>
                      <p className="text-gray-400 font-medium line-clamp-2 max-w-3xl text-lg leading-relaxed">{listing.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-10 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xs font-black text-white">
                          {listing.company?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Peer Identity</p>
                          <p className="text-white text-xs font-bold">{listing.company?.name || 'Unknown Company'}</p>
                        </div>
                      </div>

                      {listing.base_price && (
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Contract Valuation</p>
                          <p className="text-emerald-500 text-xl font-black">${listing.base_price.toLocaleString()}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Protocol Initialization</p>
                        <p className="text-white text-xs font-bold font-mono uppercase italic">{new Date(listing.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 w-full lg:w-auto">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm text-right">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Protocol Window</p>
                      {listing.closes_at ? (
                        <p className={`text-sm font-black uppercase tracking-widest ${isDeadlinePassed(listing.closes_at) ? 'text-red-500' : 'text-indigo-400'}`}>
                          {isDeadlinePassed(listing.closes_at) ? 'ARCHIVED' : `CLOSES ${new Date(listing.closes_at).toLocaleDateString()}`}
                        </p>
                      ) : (
                        <p className="text-sm font-black text-emerald-500 uppercase tracking-widest">PERSISTENT</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link
                        to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', listing.id.toString())}
                        className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] text-center hover:bg-white/10 transition-all border border-white/10"
                      >
                        Analyze Details
                      </Link>

                      {canQuote(listing) && (
                        <Link
                          to={ROUTES.PROTECTED.VENDOR.QUOTES_CREATE.replace(':listingId', listing.id.toString())}
                          className="w-full px-8 py-5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-center shadow-glow-primary hover:scale-105 transition-all"
                        >
                          Initialize Transmit
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {listings.length === 0 && !loading && (
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[40px] p-24 text-center shadow-premium relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
            <div className="relative z-10 max-w-md mx-auto">
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-4">No protocol nodes detected</h3>
              <p className="text-gray-500 font-medium mb-10">Adjust your frequency parameters or scan for new procurement signals.</p>
              <button onClick={() => setFilters({})} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-white transition-colors">Clear All Active Filters</button>
            </div>
          </div>
        )}

        {/* Pagination Mesh */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-10 border-t border-white/5">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all shadow-premium"
            >
              Previous Sector
            </button>

            <div className="flex gap-3">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-12 h-12 rounded-xl text-[10px] font-black transition-all border ${currentPage === page
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-glow-indigo'
                      : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10 shadow-premium'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition-all shadow-premium"
            >
              Next Sector
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VendorListingsBrowser;
