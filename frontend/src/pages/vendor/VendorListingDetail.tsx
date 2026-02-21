import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import auctionService from '../../services/auctionService';
import { ROUTES } from '../../config/routes';
import type { Listing } from '../../types/listings';
import type { Auction } from '../../types/auction';

const VendorListingDetail: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingQuote, setHasExistingQuote] = useState(false);
  const [auction, setAuction] = useState<Auction | null>(null);

  useEffect(() => {
    if (listingId) {
      loadListing();
      loadAuction(parseInt(listingId));
    }
  }, [listingId]);

  const loadListing = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingService.getListing(parseInt(listingId!));
      const listingData = response.data;
      setListing(listingData);

      // Check if vendor has already submitted a quote
      // Use Number() to avoid type mismatch between string/number IDs
      if (listingData.quotes && user?.id) {
        const existingQuote = listingData.quotes.find(
          quote => Number(quote.vendor_user_id) === Number(user.id)
        );
        setHasExistingQuote(!!existingQuote);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const loadAuction = async (listingId: number) => {
    try {
      const res = await auctionService.getAuctionForListing(listingId);
      setAuction(res.data.auction);
    } catch {
      // No auction yet — that's fine
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };


  const isDeadlineClose = (dateString?: string) => {
    if (!dateString) return false;
    const deadline = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const isPastDeadline = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (user?.current_profile_type !== 'vendor') {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">Only vendors can view listings. Please switch to a vendor profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !listing) {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">{error || 'Listing not found'}</p>
          <Link
            to={ROUTES.PROTECTED.VENDOR.LISTINGS}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Listings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const canSubmitQuote = listing.status === 'active' &&
    (!listing.closes_at || !isPastDeadline(listing.closes_at)) &&
    !hasExistingQuote;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center gap-6">
          <Link
            to={ROUTES.PROTECTED.VENDOR.LISTINGS}
            className="group flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Registry Archive
          </Link>
        </div>

        {/* Hero Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-10 border-b border-white/5">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white tracking-tight uppercase leading-tight">
              {listing.title}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Origin</p>
              <p className="text-emerald-500 font-black uppercase text-sm tracking-widest">{listing.company.name}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className={`px-6 py-2 rounded-full border backdrop-blur-md shadow-premium flex items-center gap-3 ${listing.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
              listing.status === 'closed' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                'bg-gray-500/10 border-white/10 text-gray-400'
              }`}>
              <div className={`h-2 w-2 rounded-full animate-pulse ${listing.status === 'active' ? 'bg-emerald-500 shadow-glow-primary' :
                listing.status === 'closed' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{listing.status}</span>
            </div>
            {listing.base_price && (
              <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Baseline Valuation</p>
                <p className="text-2xl font-black text-white">{formatCurrency(listing.base_price)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Critical Banners */}
        <div className="grid grid-cols-1 gap-6">
          {canSubmitQuote && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md rounded-[32px] p-10 flex flex-col md:flex-row justify-between items-center gap-8 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative z-10">
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Transmission Window Open</h3>
                <p className="text-gray-300 font-medium max-w-xl leading-relaxed">
                  Active procurement cycle detected. Your vendor profile is eligible for protocol bid submission. Aggregate your metrics and transmit.
                </p>
              </div>
              <Link
                to={ROUTES.PROTECTED.VENDOR.QUOTES_CREATE.replace(':listingId', listing.id.toString())}
                className="relative z-10 px-12 py-5 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-glow-primary hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
              >
                Sync Protocol Bid
              </Link>
            </div>
          )}

          {hasExistingQuote && (
            <div className="bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-md rounded-[32px] p-10 flex flex-col md:flex-row justify-between items-center gap-8 group">
              <div className="relative z-10">
                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4">Active Transmission Detected</h3>
                <p className="text-gray-300 font-medium max-w-xl leading-relaxed">
                  A protocol bid has already been registered for this entity. Monitor status updates or synchronize logic modifications.
                </p>
              </div>
              <Link
                to={ROUTES.PROTECTED.VENDOR.QUOTES}
                className="relative z-10 px-12 py-5 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-glow-indigo hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
              >
                Access Bid Monitor
              </Link>
            </div>
          )}

          {/* Auction Room CTA — show when a running OR completed auction exists and vendor has a quote */}
          {(auction?.status === 'running' || auction?.status === 'completed') && hasExistingQuote && (
            <div className={`border backdrop-blur-md rounded-[32px] p-10 flex flex-col md:flex-row justify-between items-center gap-8 ${auction.status === 'completed' ? 'bg-gray-700/20 border-gray-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
              <div className="relative z-10">
                <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${auction.status === 'completed' ? 'text-gray-300' : 'text-yellow-400'}`}>
                  {auction.status === 'completed' ? '🏁 Reverse Auction Ended' : '⚡ Reverse Auction In Progress'}
                </h3>
                <p className="text-gray-300 font-medium max-w-xl leading-relaxed">
                  {auction.status === 'completed'
                    ? 'The auction has ended. View the auction room to see your final rank and results.'
                    : 'This listing is now in a live reverse auction. Enter the auction room to place competitive bids and see your rank.'}
                </p>
              </div>
              <button
                onClick={() => navigate(ROUTES.PROTECTED.VENDOR.AUCTION_ROOM.replace(':auctionId', String(auction.id)))}
                className={`relative z-10 px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all whitespace-nowrap ${auction.status === 'completed' ? 'bg-gray-500 hover:bg-gray-400 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}
              >
                {auction.status === 'completed' ? '🏁 View Results' : '⚡ Enter Auction Room'}
              </button>
            </div>
          )}

          {listing.closes_at && isDeadlineClose(listing.closes_at) && !isPastDeadline(listing.closes_at) && (
            <div className="bg-amber-500/10 border border-amber-500/20 backdrop-blur-md rounded-3xl p-6 flex items-center gap-6">
              <div className="h-10 w-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Critical Time Delta</p>
                <p className="text-amber-500/80 font-bold uppercase text-sm">Registry closing sequence initialized: {formatDate(listing.closes_at)}</p>
              </div>
            </div>
          )}

          {listing.closes_at && isPastDeadline(listing.closes_at) && (
            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-3xl p-6 flex items-center gap-6">
              <div className="h-10 w-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Transmission window finalized on {formatDate(listing.closes_at)}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Pane */}
          <div className="lg:col-span-8 space-y-10">
            {/* Description Block */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />
              <div className="relative z-10">
                <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-10 px-3 border-l-2 border-indigo-500">Operational Scope</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                  <p className="text-gray-300 font-medium leading-relaxed whitespace-pre-wrap text-lg">
                    {listing.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Requirements */}
            {listing.requirements && listing.requirements.length > 0 && (
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-10 px-3 border-l-2 border-emerald-500">Compliance Metrics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listing.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl group hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300">
                        <div className="h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300 font-bold uppercase text-[11px] tracking-widest">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Technical Specs */}
            {listing.specifications && listing.specifications.length > 0 && (
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-10 px-3 border-l-2 border-indigo-500">Technical Integrity Matrix</h2>
                  <div className="space-y-4">
                    {listing.specifications.map((specification, index) => (
                      <div key={index} className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-glow-indigo" />
                        <span className="text-gray-400 font-medium">{specification}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Infrastructure Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            {/* Metadata Terminal */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8 pb-4 border-b border-white/10">Registry Meta</h3>

              <div className="space-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Classification</p>
                  <p className="text-white font-black uppercase text-sm tracking-widest">{listing.category}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Visibility Tier</p>
                  <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">{listing.visibility}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Initialized</p>
                    <p className="text-white font-bold text-[10px] tracking-widest">{new Date(listing.created_at).toLocaleDateString()}</p>
                  </div>
                  {listing.closes_at && (
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-red-500/60">Termination</p>
                      <p className="text-red-500 font-bold text-[10px] tracking-widest">{new Date(listing.closes_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {listing.blockchain_enabled && (
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl group hover:bg-emerald-500/10 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">Ledger Verified</span>
                    </div>
                    {listing.blockchain_tx_hash && (
                      <p className="text-[9px] text-gray-500 font-mono break-all opacity-50 group-hover:opacity-100 transition-opacity">
                        TX: {listing.blockchain_tx_hash}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Entity Profile */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8 pb-4 border-b border-white/10">Entity Identity</h3>

              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Legal Name</p>
                  <p className="text-white font-black uppercase text-sm tracking-widest">{listing.company.name}</p>
                </div>

                {listing.company.industry && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Industrial Vertical</p>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">{listing.company.industry}</p>
                  </div>
                )}

                {listing.company.website && (
                  <a
                    href={listing.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Site</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Market Analytics */}
            {listing.quotes && listing.quotes.length > 0 && (
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 shadow-premium">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8 pb-4 border-b border-white/10">Market Vectors</h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 text-center">Volume</p>
                      <p className="text-xl font-black text-white text-center">{listing.quotes.length}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 text-center">Avg Bid</p>
                      <p className="text-sm font-black text-emerald-500 text-center">
                        {formatCurrency(listing.quotes.reduce((sum, q) => sum + q.quoted_price, 0) / listing.quotes.length)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Global Actions */}
            <div className="space-y-4">
              <Link
                to={ROUTES.PROTECTED.VENDOR.QUOTES}
                className="w-full flex items-center justify-center py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.3em] hover:bg-white/20 transition-all shadow-premium"
              >
                Access Central Monitor
              </Link>
              <Link
                to={ROUTES.PROTECTED.VENDOR.LISTINGS}
                className="w-full flex items-center justify-center py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] hover:text-white transition-all"
              >
                Return to Registry
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorListingDetail;
