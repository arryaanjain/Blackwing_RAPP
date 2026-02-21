import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';
import listingService from '../../services/listingService';
import type { Listing } from '../../types/listings';

const VendorListings: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterBidStatus, setFilterBidStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await listingService.getListings({}, 1);
        setListings(res.data.data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);
  
  useEffect(() => {
    let result = [...listings];

    if (filterStatus !== 'all') {
      result = result.filter(listing => listing.status === filterStatus);
    }

    const hasBid = (listing: Listing) =>
      listing.quotes?.some((q: { vendor_user_id: number }) => q.vendor_user_id === user?.id) ?? false;

    if (filterBidStatus === 'bid') {
      result = result.filter(hasBid);
    } else if (filterBidStatus === 'nobid') {
      result = result.filter(l => !hasBid(l));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        listing =>
          listing.title.toLowerCase().includes(term) ||
          listing.description?.toLowerCase().includes(term) ||
          listing.company?.name?.toLowerCase().includes(term) ||
          listing.company?.share_id?.toLowerCase().includes(term)
      );
    }

    setFilteredListings(result);
  }, [listings, filterStatus, filterBidStatus, searchTerm, user?.id]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (closesAt: string | null | undefined) => {
    if (!closesAt) return false;
    return new Date(closesAt) < new Date();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Available Listings</h1>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 bg-blue-900/50 border border-blue-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-blue-900/50 border border-blue-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="closed">Closed Only</option>
            </select>
            
            <select
              value={filterBidStatus}
              onChange={(e) => setFilterBidStatus(e.target.value)}
              className="bg-blue-900/50 border border-blue-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Bids</option>
              <option value="bid">Bid Submitted</option>
              <option value="nobid">No Bid Yet</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-blue-800/20 backdrop-blur-sm border border-blue-700/40 rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-blue-300 mb-2">No listings found matching your filters.</p>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterBidStatus('all');
                setSearchTerm('');
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => {
              const bidSubmitted = listing.quotes?.some((q: { vendor_user_id: number }) => q.vendor_user_id === user?.id) ?? false;
              const yourBid = listing.quotes?.find((q: { vendor_user_id: number; quoted_price: number }) => q.vendor_user_id === user?.id)?.quoted_price;
              return (
                <div
                  key={listing.id}
                  className={`bg-blue-800/20 backdrop-blur-sm border ${
                    listing.status === 'closed'
                      ? 'border-blue-700/20'
                      : bidSubmitted
                        ? 'border-green-700/40'
                        : 'border-blue-700/40'
                  } rounded-lg p-6 hover:bg-blue-800/30 transition-colors`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-white">{listing.title}</h3>

                        {listing.status === 'closed' ? (
                          <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">Closed</span>
                        ) : isExpired(listing.closes_at) ? (
                          <span className="bg-red-900/50 text-red-300 text-xs px-2 py-1 rounded-full">Expired</span>
                        ) : (
                          <span className="bg-green-900/50 text-green-300 text-xs px-2 py-1 rounded-full">Active</span>
                        )}

                        {listing.visibility === 'public' ? (
                          <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded-full">Public</span>
                        ) : (
                          <span className="bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded-full">Private</span>
                        )}

                        {bidSubmitted && yourBid != null && (
                          <span className="bg-teal-900/50 text-teal-300 text-xs px-2 py-1 rounded-full">
                            Your Quote: ${yourBid.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <p className="text-blue-300 text-sm">
                        From <span className="font-medium">{listing.company?.name || '—'}</span>
                        {listing.company?.share_id && <span> ({listing.company.share_id})</span>}
                      </p>

                      <p className="text-blue-300 mt-2 line-clamp-2">{listing.description}</p>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {listing.base_price != null && (
                          <div className="bg-blue-900/30 px-3 py-2 rounded-md">
                            <p className="text-xs text-blue-400">Base Price</p>
                            <p className="text-white">${listing.base_price.toLocaleString()}</p>
                          </div>
                        )}

                        <div className="bg-blue-900/30 px-3 py-2 rounded-md">
                          <p className="text-xs text-blue-400">{listing.status === 'closed' ? 'Closed On' : 'Closes'}</p>
                          <p className={`${isExpired(listing.closes_at) && listing.status !== 'closed' ? 'text-red-400' : 'text-white'}`}>
                            {formatDate(listing.closes_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-center justify-center">
                      {listing.status === 'active' && !isExpired(listing.closes_at) ? (
                        <Link
                          to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':id', listing.id.toString())}
                          className={`${
                            bidSubmitted
                              ? 'bg-teal-700 hover:bg-teal-600'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                          } text-white px-6 py-3 rounded-lg shadow-md shadow-blue-950/20 transition duration-150 flex items-center`}
                        >
                          {bidSubmitted ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Update Quote
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                              </svg>
                              Submit Quote
                            </>
                          )}
                        </Link>
                      ) : (
                        <Link
                          to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':id', listing.id.toString())}
                          className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-150"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VendorListings;
