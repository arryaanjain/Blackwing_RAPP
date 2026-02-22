import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useToast } from '../../hooks/useToast';
import listingService from '../../services/listingService';
import auctionService from '../../services/auctionService';
import { ROUTES } from '../../config/routes';
import type { Listing, Quote } from '../../types/listings';

const CompanyBidViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [creatingAuction, setCreatingAuction] = useState(false);
  const [auctionConfig, setAuctionConfig] = useState({
    duration_minutes: 30,
    minimum_decrement_type: 'percent' as 'percent' | 'fixed',
    minimum_decrement_value: 5,
  });
  const { showToast } = useToast();

  useEffect(() => {
    const fetchListingAndBids = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching listing and bids for ID: ${id}`);
        const listingPromise = listingService.getListing(parseInt(id));
        const quotesPromise = listingService.getQuotesForListing(parseInt(id));

        const [listingRes, quotesRes] = await Promise.all([listingPromise, quotesPromise]);

        console.log('Listing received:', listingRes.data);
        console.log('Quotes received:', quotesRes.data);

        if (!listingRes.data) {
          throw new Error('Listing data is empty');
        }

        setListing(listingRes.data);

        // Sort quotes by price (ascending) initially
        const quotesData = Array.isArray(quotesRes.data) ? quotesRes.data : [];
        const sortedQuotes = [...quotesData].sort((a, b) => (Number(a.quoted_price) || 0) - (Number(b.quoted_price) || 0));
        setQuotes(sortedQuotes);
      } catch (err: any) {
        console.error('Error in fetchListingAndBids:', err);
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load listing details and bids.';
        setError(errorMessage);
        showToast({
          title: "Execution Error",
          description: errorMessage,
          status: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListingAndBids();
  }, [id]);

  const handleAcceptQuote = async (quoteId: number) => {
    try {
      setUpdating(quoteId);
      await listingService.reviewQuote(quoteId, {
        status: 'accepted',
        review_notes: 'Bid accepted by company.'
      });

      showToast({
        title: "Success",
        description: "Quote accepted successfully.",
        status: "success"
      });

      // Update local state
      setQuotes((prev: Quote[]) => prev.map((q: Quote) =>
        q.id === quoteId ? { ...q, status: 'accepted' } : q
      ));

      if (listing) {
        setListing({ ...listing, status: 'closed' });
      }
    } catch (err: any) {
      console.error('Error accepting bid:', err);
      showToast({
        title: "Error",
        description: err.response?.data?.message || "Failed to accept quote.",
        status: "error"
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectQuote = async (quoteId: number) => {
    if (!confirm('Are you sure you want to reject this quote?')) return;

    try {
      setUpdating(quoteId);
      await listingService.reviewQuote(quoteId, {
        status: 'rejected',
        review_notes: 'Bid rejected by company.'
      });

      showToast({
        title: "Quote Rejected",
        description: "The quote has been marked as rejected.",
        status: "info"
      });

      setQuotes((prev: Quote[]) => prev.map((q: Quote) =>
        q.id === quoteId ? { ...q, status: 'rejected' } : q
      ));
    } catch (err: any) {
      console.error('Error rejecting bid:', err);
      showToast({
        title: "Error",
        description: err.response?.data?.message || "Failed to reject quote.",
        status: "error"
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleSendToAuction = async () => {
    if (!listing) return;
    try {
      setCreatingAuction(true);
      await auctionService.createAuction({
        listing_id: listing.id,
        duration_minutes: auctionConfig.duration_minutes,
        minimum_decrement_type: auctionConfig.minimum_decrement_type,
        minimum_decrement_value: auctionConfig.minimum_decrement_value,
      });

      showToast({
        title: 'Auction Created!',
        description: `Reverse auction started. ${eligibleQuoteCount} vendors have been enrolled.`,
        status: 'success',
      });

      setShowAuctionModal(false);

      // Navigate to the company auction room
      navigate(ROUTES.PROTECTED.COMPANY.AUCTION_ROOM.replace(':id', String(listing.id)));
    } catch (err: any) {
      console.error('Error creating auction:', err);
      const msg = err.response?.data?.message || 'Failed to create auction.';
      showToast({ title: 'Error', description: msg, status: 'error' });
    } finally {
      setCreatingAuction(false);
    }
  };

  // Count eligible (non-rejected, non-withdrawn) quotes
  const eligibleQuoteCount = quotes.filter(
    (q) => !['rejected', 'withdrawn'].includes(q.status)
  ).length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">{error}</p>
          <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Back to Listings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!listing) {
    return (
      <DashboardLayout>
        <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6 text-center">
          <p className="text-blue-300 mb-4">Listing not found</p>
          <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Back to Listings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Listing Details */}
        <div className="bg-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{listing.title}</h1>
              <p className="text-blue-200 mb-4">{listing.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm flex items-center ${listing.status === 'active'
              ? 'bg-green-900/50 text-green-300'
              : listing.status === 'closed'
                ? 'bg-gray-900/50 text-gray-300'
                : 'bg-red-900/50 text-red-300'
              }`}>
              <span className={`h-2 w-2 rounded-full mr-2 ${listing.status === 'active' ? 'bg-green-500' :
                listing.status === 'closed' ? 'bg-gray-500' : 'bg-red-500'
                }`}></span>
              <span className="capitalize">{listing.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-blue-300 text-sm">Listing #</p>
              <p className="text-white font-medium">{listing.listing_number}</p>
            </div>
            <div>
              <p className="text-blue-300 text-sm">Category</p>
              <p className="text-white font-medium">{listing.category}</p>
            </div>
            {listing.base_price && (
              <div>
                <p className="text-blue-300 text-sm">Base Price</p>
                <p className="text-white font-medium">{formatCurrency(listing.base_price)}</p>
              </div>
            )}
            {listing.closes_at && (
              <div>
                <p className="text-blue-300 text-sm">Deadline</p>
                <p className="text-white font-medium">{formatDate(listing.closes_at)}</p>
              </div>
            )}
            <div>
              <p className="text-blue-300 text-sm">Visibility</p>
              <p className="text-white font-medium capitalize">{listing.visibility}</p>
            </div>
          </div>
        </div>

        {/* Bids Section */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Responses ({quotes.length})
          </h2>

          {quotes.length === 0 ? (
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6 text-center">
              <p className="text-blue-300">No quotes have been submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className={`bg-blue-900/20 backdrop-blur-sm border ${quote.status === 'accepted' ? 'border-green-500' :
                    quote.status === 'rejected' ? 'border-red-800/40' : 'border-blue-800/40'
                    } rounded-lg p-6 hover:bg-blue-800/30 transition-colors`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-700 text-white text-xs px-2 py-1 rounded-full">
                          #{quote.quote_number}
                        </span>
                        <h3 className="text-lg font-medium text-white">{quote.vendor?.name || 'Unknown Vendor'}</h3>
                      </div>
                      <p className="text-blue-300 line-clamp-2 mb-2">{quote.proposal_details}</p>
                      <div className="flex gap-4 text-sm text-blue-400">
                        <span>Delivery: {quote.delivery_days} days</span>
                        <span>Submitted: {formatDate(quote.submitted_at)}</span>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                      <div className="text-2xl font-bold text-green-300">{formatCurrency(quote.quoted_price)}</div>
                      <div className={`mt-2 px-3 py-1 rounded-full text-sm flex items-center ${quote.status === 'accepted' ? 'bg-green-900/50 text-green-300' :
                        quote.status === 'rejected' ? 'bg-red-900/50 text-red-300' :
                          quote.status === 'withdrawn' ? 'bg-gray-900/50 text-gray-300' :
                            'bg-blue-900/50 text-blue-300'
                        }`}>
                        <span className={`h-2 w-2 rounded-full mr-2 ${quote.status === 'accepted' ? 'bg-green-500' :
                          quote.status === 'rejected' ? 'bg-red-500' :
                            quote.status === 'withdrawn' ? 'bg-gray-500' :
                              'bg-blue-500'
                          }`}></span>
                        <span className="capitalize">{quote.status?.replace('_', ' ') || quote.status}</span>
                      </div>
                    </div>
                  </div>

                  {listing.status === 'active' && quote.status === 'submitted' && (
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-blue-800/30">
                      <button
                        onClick={() => handleRejectQuote(quote.id)}
                        disabled={updating !== null}
                        className="bg-red-900/40 hover:bg-red-800/60 text-red-200 border border-red-800/50 px-4 py-2 rounded text-sm transition-colors"
                      >
                        Reject Quote
                      </button>
                      <button
                        onClick={() => handleAcceptQuote(quote.id)}
                        disabled={updating !== null}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        {updating === quote.id ? 'Processing...' : 'Accept & Award Contract'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
          <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors font-medium">
            Back to Listings
          </Link>

          {listing.status === 'active' && (
            <div className="flex gap-3">
              {/* Send to Auction Button — needs ≥2 eligible quotes */}
              {eligibleQuoteCount >= 2 ? (
                <button
                  onClick={() => setShowAuctionModal(true)}
                  className="relative group bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Send to Auction
                  <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full">{eligibleQuoteCount} vendors</span>
                </button>
              ) : (
                <div className="text-amber-400/60 text-xs flex items-center gap-1.5 px-4 py-2.5 bg-amber-900/20 border border-amber-800/30 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Need ≥2 quotes for auction
                </div>
              )}

              <button
                className="bg-red-900/40 hover:bg-red-800/40 text-red-200 border border-red-800/50 px-4 py-2 rounded transition-all text-sm"
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this listing? This will withdraw all current quotes.')) {
                    listingService.deleteListing(listing.id).then(() => {
                      showToast({ title: "Listing Cancelled", description: "The listing has been successfully cancelled.", status: "info" });
                      setListing({ ...listing, status: 'cancelled' });
                    });
                  }
                }}
              >
                Cancel Listing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ────── Auction Configuration Modal ────── */}
      {showAuctionModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAuctionModal(false)} />

          {/* Modal */}
          <div className="relative bg-[#0d1117] border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 w-full max-w-lg mx-4 p-0 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-b border-amber-800/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Launch Reverse Auction</h3>
                  <p className="text-amber-300/70 text-xs mt-0.5">
                    {eligibleQuoteCount} vendors will be auto-enrolled and compete in real-time
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Auction Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 60, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setAuctionConfig({ ...auctionConfig, duration_minutes: mins })}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${auctionConfig.duration_minutes === mins
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:border-amber-500/40 hover:text-white'
                        }`}
                    >
                      {mins < 60 ? `${mins} min` : `${mins / 60} hr`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Decrement */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Bid Decrement</label>
                <div className="flex gap-3">
                  <select
                    value={auctionConfig.minimum_decrement_type}
                    onChange={(e) => setAuctionConfig({ ...auctionConfig, minimum_decrement_type: e.target.value as 'percent' | 'fixed' })}
                    className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-amber-500/50 focus:outline-none"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={auctionConfig.minimum_decrement_value}
                    onChange={(e) => setAuctionConfig({ ...auctionConfig, minimum_decrement_value: Number(e.target.value) })}
                    className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-amber-500/50 focus:outline-none"
                    placeholder={auctionConfig.minimum_decrement_type === 'percent' ? 'e.g. 5' : 'e.g. 1000'}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Each new bid must be at least {auctionConfig.minimum_decrement_value}{auctionConfig.minimum_decrement_type === 'percent' ? '%' : ' $'} lower than the current best
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg px-4 py-3">
                <div className="flex gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-amber-300/80 space-y-1">
                    <p>The auction starts <strong>immediately</strong> after creation.</p>
                    <p>All {eligibleQuoteCount} vendors with active quotes will be auto-enrolled.</p>
                    <p>The lowest bidder at the end wins the contract.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowAuctionModal(false)}
                disabled={creatingAuction}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToAuction}
                disabled={creatingAuction}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 flex items-center gap-2"
              >
                {creatingAuction ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Launch Auction Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CompanyBidViewer;
