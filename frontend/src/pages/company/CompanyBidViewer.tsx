import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useToast } from '../../hooks/useToast';
import listingService from '../../services/listingService';
import { ROUTES } from '../../config/routes';
import type { Listing, Quote } from '../../types/listings';

const CompanyBidViewer: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchListingAndBids = async () => {
      if (!listingId) return;

      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching listing and bids for ID: ${listingId}`);
        const listingPromise = listingService.getListing(parseInt(listingId));
        const quotesPromise = listingService.getQuotesForListing(parseInt(listingId));

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
  }, [listingId]);

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

        <div className="flex justify-between mt-6">
          <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors font-medium">
            Back to Listings
          </Link>

          {listing.status === 'active' && (
            <button
              className="bg-red-900/40 hover:bg-red-800/40 text-red-200 border border-red-800/50 px-4 py-2 rounded transition-all"
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyBidViewer;
