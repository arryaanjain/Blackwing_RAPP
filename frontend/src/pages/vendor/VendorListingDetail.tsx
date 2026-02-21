import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import { ROUTES } from '../../config/routes';
import type { Listing } from '../../types/listings';

const VendorListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingQuote, setHasExistingQuote] = useState(false);

  useEffect(() => {
    if (id) {
      loadListing();
    }
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingService.getListing(parseInt(id!));
      const listingData = response.data;
      setListing(listingData);
      
      // Check if vendor has already submitted a quote
      if (listingData.quotes && user?.id) {
        const existingQuote = listingData.quotes.find(quote => quote.vendor_user_id === user.id);
        setHasExistingQuote(!!existingQuote);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load listing');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/50 text-green-300';
      case 'draft': return 'bg-gray-900/50 text-gray-300';
      case 'closed': return 'bg-red-900/50 text-red-300';
      case 'cancelled': return 'bg-red-900/50 text-red-300';
      default: return 'bg-gray-900/50 text-gray-300';
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                to={ROUTES.PROTECTED.VENDOR.LISTINGS}
                className="text-blue-300 hover:text-blue-100"
              >
                ← Back to Listings
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
            <p className="text-blue-300">
              by <span className="font-medium">{listing.company.name}</span>
            </p>
          </div>
          
          <div className="text-right">
            <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(listing.status)}`}>
              <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                listing.status === 'active' ? 'bg-green-500' : 
                listing.status === 'closed' ? 'bg-red-500' : 'bg-gray-500'
              }`}></span>
              {listing.status.toUpperCase()}
            </span>
            {listing.base_price && (
              <div className="text-2xl font-bold text-green-300 mt-2">
                Base: {formatCurrency(listing.base_price)}
              </div>
            )}
          </div>
        </div>

        {/* Quote Action */}
        {canSubmitQuote && (
          <div className="bg-green-900/20 backdrop-blur-sm border border-green-800/40 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-green-300 mb-2">Ready to Submit a Quote?</h3>
                <p className="text-green-200">
                  This listing is open for quote submissions. Submit your proposal to compete for this project.
                </p>
              </div>
              <Link
                to={ROUTES.PROTECTED.VENDOR.QUOTES_CREATE.replace(':listingId', listing.id.toString())}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium whitespace-nowrap"
              >
                Submit Quote
              </Link>
            </div>
          </div>
        )}

        {/* Existing Quote Alert */}
        {hasExistingQuote && (
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Quote Already Submitted</h3>
                <p className="text-blue-200">
                  You have already submitted a quote for this listing. You can view and manage your quote.
                </p>
              </div>
              <Link
                to={ROUTES.PROTECTED.VENDOR.QUOTES}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium whitespace-nowrap"
              >
                View My Quotes
              </Link>
            </div>
          </div>
        )}

        {/* Deadline Warning */}
        {listing.closes_at && isDeadlineClose(listing.closes_at) && (
          <div className="bg-yellow-900/20 backdrop-blur-sm border border-yellow-800/40 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-yellow-300 font-medium">
                Deadline approaching! This listing closes on {formatDate(listing.closes_at)}.
              </p>
            </div>
          </div>
        )}

        {/* Past Deadline */}
        {listing.closes_at && isPastDeadline(listing.closes_at) && (
          <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300 font-medium">
                This listing closed on {formatDate(listing.closes_at)}. No new quotes can be submitted.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Project Description</h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-blue-100 whitespace-pre-wrap">{listing.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {listing.requirements && listing.requirements.length > 0 && (
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {listing.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-blue-100">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {listing.specifications && listing.specifications.length > 0 && (
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Technical Specifications</h2>
                <ul className="space-y-2">
                  {listing.specifications.map((specification, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-blue-100">{specification}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Listing Info */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Listing Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Category</label>
                  <p className="text-white">{listing.category}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Visibility</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    listing.visibility === 'public' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                  }`}>
                    {listing.visibility.toUpperCase()}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Posted</label>
                  <p className="text-white text-sm">{formatDate(listing.created_at)}</p>
                </div>

                {listing.opens_at && (
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Opens</label>
                    <p className="text-white text-sm">{formatDate(listing.opens_at)}</p>
                  </div>
                )}

                {listing.closes_at && (
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Closes</label>
                    <p className="text-white text-sm">{formatDate(listing.closes_at)}</p>
                  </div>
                )}

                {listing.blockchain_enabled && (
                  <div className="pt-3 border-t border-blue-700/30">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-green-300 text-sm font-medium">Blockchain Verified</span>
                    </div>
                    {listing.blockchain_tx_hash && (
                      <p className="text-xs text-blue-400 mt-1 break-all">{listing.blockchain_tx_hash}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Company</label>
                  <p className="text-white font-medium">{listing.company.name}</p>
                </div>
                
                {listing.company.industry && (
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Industry</label>
                    <p className="text-blue-100 text-sm">{listing.company.industry}</p>
                  </div>
                )}
                
                {listing.company.description && (
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">About</label>
                    <p className="text-blue-100 text-sm line-clamp-3">{listing.company.description}</p>
                  </div>
                )}
                
                {listing.company.website && (
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Website</label>
                    <a 
                      href={listing.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-100 underline text-sm break-all"
                    >
                      {listing.company.website}
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Member Since</label>
                  <p className="text-blue-100 text-sm">{formatDate(listing.company.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Quote Statistics */}
            {listing.quotes && listing.quotes.length > 0 && (
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quote Activity</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Total Quotes:</span>
                    <span className="text-white font-medium">{listing.quotes.length}</span>
                  </div>
                  
                  {listing.quotes.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Avg. Quote:</span>
                        <span className="text-white font-medium">
                          {formatCurrency(listing.quotes.reduce((sum, quote) => sum + quote.quoted_price, 0) / listing.quotes.length)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Range:</span>
                        <span className="text-white font-medium text-sm">
                          {formatCurrency(Math.min(...listing.quotes.map(q => q.quoted_price)))} - {formatCurrency(Math.max(...listing.quotes.map(q => q.quoted_price)))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              
              <div className="space-y-3">
                {canSubmitQuote && (
                  <Link
                    to={ROUTES.PROTECTED.VENDOR.QUOTES_CREATE.replace(':listingId', listing.id.toString())}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium text-center block"
                  >
                    Submit Quote
                  </Link>
                )}

                <Link
                  to={ROUTES.PROTECTED.VENDOR.QUOTES}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium text-center block"
                >
                  View My Quotes
                </Link>

                <Link
                  to={ROUTES.PROTECTED.VENDOR.LISTINGS}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium text-center block"
                >
                  Browse More Listings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorListingDetail;
