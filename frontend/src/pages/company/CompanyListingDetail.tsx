import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import { ROUTES } from '../../config/routes';
import type { Listing } from '../../types/listings';

const CompanyListingDetail: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (listingId) {
      loadListing(parseInt(listingId));
    }
  }, [listingId]);

  const loadListing = async (listingId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingService.getListing(listingId);
      setListing(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
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

  const isOwner = user?.current_profile_type === 'company' &&
    listing?.company.id === user.current_profile_id;

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
        <div className="space-y-6">
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
            {error || 'Listing not found'}
          </div>
          <button
            onClick={() => navigate(ROUTES.PROTECTED.COMPANY.LISTINGS)}
            className="text-blue-300 hover:text-blue-100 flex items-center gap-2"
          >
            ← Back to Listings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!isOwner) {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">You are not authorized to view this listing.</p>
          <button
            onClick={() => navigate(ROUTES.PROTECTED.COMPANY.LISTINGS)}
            className="text-blue-300 hover:text-blue-100"
          >
            ← Back to Listings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => navigate(ROUTES.PROTECTED.COMPANY.LISTINGS)}
              className="text-blue-300 hover:text-blue-100 mb-4 flex items-center gap-2"
            >
              ← Back to Listings
            </button>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{listing.title}</h1>
              <span className="text-2xl">{listing.visibility === 'public' ? '🌐' : '🔒'}</span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(listing.status)}`}>
                <span className={`inline-block h-2 w-2 rounded-full mr-2 ${listing.status === 'active' ? 'bg-green-500' :
                  listing.status === 'draft' ? 'bg-yellow-500' :
                    listing.status === 'closed' ? 'bg-gray-500' : 'bg-red-500'
                  }`}></span>
                {listing.status.toUpperCase()}
              </span>
            </div>
            <p className="text-blue-300 text-lg">
              Listing #{listing.listing_number}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(ROUTES.PROTECTED.COMPANY.LISTINGS_EDIT.replace(':listingId', listing.id.toString()))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Edit Listing
            </button>
            <button
              onClick={() => navigate(ROUTES.PROTECTED.COMPANY.LISTINGS_QUOTES.replace(':listingId', listing.id.toString()))}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              View Quotes ({listing.quotes?.length || 0})
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Description and Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <div className="prose max-w-none">
                <p className="text-blue-100 whitespace-pre-wrap">{listing.description}</p>
              </div>
            </div>

            {listing.requirements && listing.requirements.length > 0 && (
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-2">
                  {listing.requirements.map((req, index) => (
                    <li key={index} className="text-blue-100">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {listing.specifications && listing.specifications.length > 0 && (
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Specifications</h2>
                <ul className="list-disc list-inside space-y-2">
                  {listing.specifications.map((spec, index) => (
                    <li key={index} className="text-blue-100">{spec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar with key information */}
          <div className="space-y-6">
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Listing Details</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-blue-300">Company</span>
                  <p className="text-white">{listing.company.name}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-blue-300">Category</span>
                  <p className="text-white">{listing.category}</p>
                </div>

                {listing.base_price && (
                  <div>
                    <span className="text-sm font-medium text-blue-300">Base Price</span>
                    <p className="text-white text-xl font-bold">
                      ${listing.base_price.toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-blue-300">Visibility</span>
                  <p className="text-white capitalize">{listing.visibility}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-blue-300">Created</span>
                  <p className="text-white">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>

                {listing.opens_at && (
                  <div>
                    <span className="text-sm font-medium text-blue-300">Opens</span>
                    <p className="text-white">
                      {new Date(listing.opens_at).toLocaleString()}
                    </p>
                  </div>
                )}

                {listing.closes_at && (
                  <div>
                    <span className="text-sm font-medium text-blue-300">Closes</span>
                    <p className="text-white">
                      {new Date(listing.closes_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {listing.blockchain_enabled && (
              <div className="bg-blue-800/30 backdrop-blur-sm border border-blue-600/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-100 mb-2 flex items-center gap-2">
                  ⛓ Blockchain Enabled
                </h3>
                <p className="text-blue-200 text-sm">
                  This listing is blockchain-verified for enhanced transparency and security.
                </p>
                {listing.blockchain_tx_hash && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-blue-300">Transaction Hash:</span>
                    <p className="text-xs font-mono text-blue-200 break-all">
                      {listing.blockchain_tx_hash}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-300">Total Quotes:</span>
                  <span className="text-white font-medium">{listing.quotes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300">Status:</span>
                  <span className="text-white font-medium capitalize">{listing.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300">Visibility:</span>
                  <span className="text-white font-medium capitalize">{listing.visibility}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyListingDetail;
