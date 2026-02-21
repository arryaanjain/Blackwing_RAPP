import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import { ROUTES } from '../../config/routes';
import type { Listing, ListingFilters, PaginatedResponse } from '../../types/listings';

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

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'public' ? '🌐' : '🔒';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Browse Listings</h1>
            <p className="text-blue-300">Find and submit quotes for procurement opportunities</p>
          </div>
          <Link
            to={ROUTES.PROTECTED.VENDOR.QUOTES}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Quotes
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Category</label>
              <input
                type="text"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                placeholder="Enter category..."
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
        {loading && listings.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">
                      <Link
                        to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', listing.id.toString())}
                        className="hover:text-blue-300 transition-colors"
                      >
                        {listing.title}
                      </Link>
                    </h3>
                    <span className="text-lg">
                      {getVisibilityIcon(listing.visibility)}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(listing.status)}`}>
                      <span className={`inline-block h-2 w-2 rounded-full mr-2 ${listing.status === 'active' ? 'bg-green-500' :
                          listing.status === 'closed' ? 'bg-gray-500' : 'bg-red-500'
                        }`}></span>
                      {listing.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-blue-200 mb-3 line-clamp-2">{listing.description}</p>
                  <div className="flex items-center gap-4 text-sm text-blue-300">
                    <span>Company: {listing.company.name}</span>
                    <span>Category: {listing.category}</span>
                    {listing.base_price && (
                      <span>Base Price: ${listing.base_price.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-blue-400 mb-1">
                    Created {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                  {listing.closes_at && (
                    <p className={`text-sm ${isDeadlinePassed(listing.closes_at) ? 'text-red-300' : 'text-blue-400'}`}>
                      {isDeadlinePassed(listing.closes_at) ? 'Closed' : 'Closes'} {new Date(listing.closes_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Deadline warning */}
              {listing.closes_at && !isDeadlinePassed(listing.closes_at) && (
                <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    ⏰ Deadline: {new Date(listing.closes_at).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-blue-800/40">
                <Link
                  to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', listing.id.toString())}
                  className="text-blue-300 hover:text-blue-100 text-sm font-medium"
                >
                  View Details
                </Link>

                {canQuote(listing) && (
                  <Link
                    to={ROUTES.PROTECTED.VENDOR.QUOTES_CREATE.replace(':listingId', listing.id.toString())}
                    className="text-green-300 hover:text-green-100 text-sm font-medium"
                  >
                    Submit Quote
                  </Link>
                )}

                {!canQuote(listing) && listing.status === 'active' && (
                  <span className="text-gray-400 text-sm">
                    Deadline passed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {listings.length === 0 && !loading && (
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-12 text-center">
            <div className="text-blue-300 text-lg mb-4">
              No listings found
            </div>
            <p className="text-blue-400 mb-4">
              Try adjusting your filters or check back later for new opportunities.
            </p>
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

export default VendorListingsBrowser;
