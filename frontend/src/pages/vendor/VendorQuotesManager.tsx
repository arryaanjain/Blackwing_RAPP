import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import { ROUTES } from '../../config/routes';
import type { Quote, QuoteFilters, PaginatedResponse } from '../../types/listings';

const VendorQuotesManager: React.FC = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<QuoteFilters>({});

  useEffect(() => {
    loadQuotes();
  }, [currentPage, filters]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingService.getQuotes(filters, currentPage);
      const data: PaginatedResponse<Quote> = response.data;

      setQuotes(data.data);
      setTotalPages(data.last_page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof QuoteFilters, value: any) => {
    setFilters((prev: QuoteFilters) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-900/50 text-blue-300';
      case 'under_review': return 'bg-yellow-900/50 text-yellow-300';
      case 'accepted': return 'bg-green-900/50 text-green-300';
      case 'rejected': return 'bg-red-900/50 text-red-300';
      case 'withdrawn': return 'bg-gray-900/50 text-gray-300';
      default: return 'bg-gray-900/50 text-gray-300';
    }
  };

  const handleWithdraw = async (quoteId: number) => {
    if (!confirm('Are you sure you want to withdraw this quote? This action cannot be undone.')) {
      return;
    }

    try {
      await listingService.withdrawQuote(quoteId);
      loadQuotes(); // Reload to reflect changes
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to withdraw quote');
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

  if (user?.current_profile_type !== 'vendor') {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">Only vendors can manage quotes. Please switch to a vendor profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Quotes</h1>
            <p className="text-blue-300">Manage your submitted quotes and track their status</p>
          </div>
          <Link
            to={ROUTES.PROTECTED.VENDOR.LISTINGS}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Listings
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Listing ID</label>
              <input
                type="number"
                value={filters.listing_id || ''}
                onChange={(e) => handleFilterChange('listing_id', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Enter listing ID..."
                className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({});
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && quotes.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Quotes Grid */}
        <div className="grid gap-6">
          {quotes.map((quote) => (
            <div key={quote.id} className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">
                      Quote #{quote.quote_number}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                      <span className={`inline-block h-2 w-2 rounded-full mr-2 ${quote.status === 'accepted' ? 'bg-green-500' :
                        quote.status === 'rejected' ? 'bg-red-500' :
                          quote.status === 'under_review' ? 'bg-yellow-500' :
                            quote.status === 'withdrawn' ? 'bg-gray-500' : 'bg-blue-500'
                        }`}></span>
                      {quote.status?.replace('_', ' ').toUpperCase() || quote.status}
                    </span>
                  </div>

                  <p className="text-blue-200 mb-3">
                    <Link
                      to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', String(quote.listing.id))}
                      className="text-blue-300 hover:text-blue-100 font-medium"
                    >
                      {quote.listing?.title || 'Unknown Listing'}
                    </Link>
                  </p>

                  <div className="flex items-center gap-4 text-sm text-blue-300">
                    <span>Company: {quote.listing?.company?.name || 'Unknown Company'}</span>
                    <span>Delivery: {quote.delivery_days} days</span>
                    <span>Submitted: {formatDate(quote.submitted_at)}</span>
                    {quote.expires_at && (
                      <span>Expires: {formatDate(quote.expires_at)}</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-green-300 mb-2">
                    {formatCurrency(quote.quoted_price)}
                  </div>
                  {quote.reviewed_at && quote.reviewed_by_user && (
                    <p className="text-sm text-blue-400">
                      Reviewed by {quote.reviewed_by_user?.name || 'Admin'} on{' '}
                      {formatDate(quote.reviewed_at)}
                    </p>
                  )}
                </div>
              </div>

              {/* Proposal excerpt */}
              <div className="mb-4 p-3 bg-blue-800/20 rounded-lg">
                <p className="text-blue-100 text-sm line-clamp-3">
                  {quote.proposal_details}
                </p>
              </div>

              {/* Review notes if any */}
              {quote.review_notes && (
                <div className="mb-4 p-3 bg-yellow-900/20 border-l-4 border-yellow-500">
                  <p className="text-sm font-medium text-yellow-200 mb-1">Review Notes:</p>
                  <p className="text-yellow-100 text-sm">{quote.review_notes}</p>
                </div>
              )}

              {/* Line items summary if available */}
              {quote.line_items && quote.line_items.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-blue-200 mb-2">
                    Line Items ({quote.line_items.length} items)
                  </p>
                  <div className="text-sm text-blue-300">
                    {quote.line_items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.description}</span>
                        <span>{formatCurrency(item.total_price)}</span>
                      </div>
                    ))}
                    {quote.line_items.length > 3 && (
                      <div className="text-blue-400 text-xs mt-1">
                        ... and {quote.line_items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-blue-800/40">
                <Link
                  to={ROUTES.PROTECTED.VENDOR.QUOTES_DETAIL.replace(':quoteId', String(quote.id))}
                  className="text-blue-300 hover:text-blue-100 text-sm font-medium"
                >
                  View Details
                </Link>

                {quote.status === 'submitted' && (
                  <>
                    <Link
                      to={ROUTES.PROTECTED.VENDOR.QUOTES_EDIT.replace(':quoteId', String(quote.id))}
                      className="text-blue-300 hover:text-blue-100 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleWithdraw(quote.id)}
                      className="text-red-300 hover:text-red-100 text-sm font-medium"
                    >
                      Withdraw
                    </button>
                  </>
                )}

                <Link
                  to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', String(quote.listing.id))}
                  className="text-blue-300 hover:text-blue-100 text-sm font-medium"
                >
                  View Listing
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {quotes.length === 0 && !loading && (
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-12 text-center">
            <div className="text-blue-300 text-lg mb-4">
              No quotes found
            </div>
            <p className="text-blue-400 mb-4">
              You haven't submitted any quotes yet. Start by browsing listings to submit your first quote!
            </p>
            <Link
              to={ROUTES.PROTECTED.VENDOR.LISTINGS}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-block"
            >
              Browse Open Listings
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-blue-800/30 border border-blue-700/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700/30 text-white"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-md ${currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-blue-800/30 border-blue-700/50 hover:bg-blue-700/30 text-white'
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-blue-800/30 border border-blue-700/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700/30 text-white"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VendorQuotesManager;
