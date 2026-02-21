import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import listingService from '../../services/listingService';
import connectionService from '../../services/connectionService';
import type { Listing } from '../../types/listings';
import type { VendorCompanyConnection } from '../../types/connections';

const VendorDashboard: React.FC = () => {
  const { user, currentProfile } = useAuth();
  const vendorProfile = currentProfile?.type === 'vendor' ? currentProfile : null;
  const [availableListings, setAvailableListings] = useState<Listing[]>([]);
  const [associatedCompanies, setAssociatedCompanies] = useState<VendorCompanyConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeBids: 0,
    totalCompanies: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [listingsRes, quotesRes, connectionsRes] = await Promise.all([
          listingService.getListings({ status: 'active' }, 1),
          listingService.getQuotes({ status: 'submitted' }, 1),
          connectionService.getConnections()
        ]);

        const listings: Listing[] = listingsRes.data.data;
        const connections: VendorCompanyConnection[] = connectionsRes.connections || [];

        setAvailableListings(listings);
        setAssociatedCompanies(connections);
        setStats({
          totalListings: listingsRes.data.total,
          activeBids: quotesRes.data.total,
          totalCompanies: connections.length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50 shadow-lg shadow-blue-900/30">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome, {vendorProfile?.vendor_name || vendorProfile?.name}</h1>
          <p className="text-blue-200">
            View available listings and manage your company connections.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-800 to-blue-950 rounded-lg shadow-xl p-6 border border-blue-700 shadow-blue-900/30">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-700 bg-opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-blue-200 text-sm font-medium uppercase">Available Listings</p>
                <p className="text-white text-2xl font-semibold">{stats.totalListings}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-800 to-indigo-950 rounded-lg shadow-xl p-6 border border-indigo-700 shadow-indigo-900/30">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-700 bg-opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-blue-200 text-sm font-medium uppercase">Your Active Bids</p>
                <p className="text-white text-2xl font-semibold">{stats.activeBids}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-800 to-purple-950 rounded-lg shadow-xl p-6 border border-purple-700 shadow-purple-900/30">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-700 bg-opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-blue-200 text-sm font-medium uppercase">Connected Companies</p>
                <p className="text-white text-2xl font-semibold">{stats.totalCompanies}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={ROUTES.PROTECTED.VENDOR.LISTINGS} className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg shadow-xl hover:from-blue-800 hover:to-indigo-900 transition duration-200 shadow-blue-900/30">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-white font-medium">Browse Listings</span>
            </div>
          </Link>

          <Link to={ROUTES.PROTECTED.VENDOR.QUOTES} className="flex items-center justify-center p-6 bg-gradient-to-r from-green-700 to-emerald-800 rounded-lg shadow-xl hover:from-green-800 hover:to-emerald-900 transition duration-200 shadow-green-900/30">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-white font-medium">My Quotes</span>
            </div>
          </Link>

          <Link to={ROUTES.PROTECTED.VENDOR.COMPANIES} className="flex items-center justify-center p-6 bg-gradient-to-r from-purple-700 to-pink-800 rounded-lg shadow-xl hover:from-purple-800 hover:to-pink-900 transition duration-200 shadow-purple-900/30">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-white font-medium">Manage Companies</span>
            </div>
          </Link>
        </div>

        {/* Available Listings */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Available Listings</h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : availableListings.length === 0 ? (
            <div className="bg-blue-950/60 backdrop-blur-sm border border-blue-700/40 rounded-lg p-8 text-center shadow-lg shadow-blue-950/20">
              <p className="text-blue-300">No available listings at the moment.</p>
              <Link to={ROUTES.PROTECTED.VENDOR.COMPANIES} className="mt-4 inline-block bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md">
                Connect with More Companies
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {availableListings.map((listing) => {
                const bidSubmitted = listing.quotes?.some((q: { vendor_user_id: number }) => q.vendor_user_id === user?.id) ?? false;
                return (
                  <div
                    key={listing.id}
                    className="bg-blue-950/60 backdrop-blur-sm border border-blue-700/40 rounded-lg p-6 hover:bg-blue-900/40 transition-colors shadow-lg shadow-blue-950/20"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">{listing.title}</h3>
                        <p className="text-blue-300 text-sm mt-1">
                          From <span className="font-medium">{listing.company?.name}</span>
                          {listing.company?.share_id && <span> ({listing.company.share_id})</span>}
                        </p>
                        <p className="text-blue-300 mt-1 truncate max-w-lg">{listing.description}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          {listing.base_price != null && (
                            <span className="text-blue-200 text-sm">
                              Base Price: <span className="font-medium">${listing.base_price.toLocaleString()}</span>
                            </span>
                          )}
                          <span className="text-blue-200 text-sm capitalize">
                            Visibility: <span className="font-medium">{listing.visibility}</span>
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                        <div className={`px-3 py-1 rounded-full text-sm flex items-center ${bidSubmitted
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-yellow-900/50 text-yellow-300'
                          }`}>
                          <span className={`h-2 w-2 rounded-full mr-2 ${bidSubmitted ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></span>
                          <span>{bidSubmitted ? 'Quote Submitted' : 'Not Quoted Yet'}</span>
                        </div>
                        {listing.closes_at && (
                          <span className="text-blue-300 text-sm mt-2">
                            Closes: {formatDate(listing.closes_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link
                        to={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL.replace(':listingId', listing.id.toString())}
                        className={`${bidSubmitted
                            ? 'bg-blue-700 hover:bg-blue-600'
                            : 'bg-green-700 hover:bg-green-600'
                          } text-white px-4 py-2 rounded-md shadow-md shadow-blue-950/20 transition-colors flex items-center text-sm font-medium`}
                      >
                        {bidSubmitted ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Listing
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Submit Quote
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Connected Companies */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Connected Companies</h2>
          {associatedCompanies.length === 0 ? (
            <div className="bg-blue-950/60 backdrop-blur-sm border border-blue-700/40 rounded-lg p-8 text-center shadow-lg shadow-blue-950/20">
              <p className="text-blue-300">You're not connected to any companies yet.</p>
              <Link to={ROUTES.PROTECTED.VENDOR.COMPANIES} className="mt-4 inline-block bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md">
                Add Company Connection
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {associatedCompanies.slice(0, 3).map((connection) => {
                const companyName = connection.company?.company_profile?.company_name || (connection.company as any)?.name || connection.company_share_id;
                return (
                  <div
                    key={connection.id}
                    className="bg-blue-950/60 backdrop-blur-sm border border-blue-700/40 rounded-lg p-6 hover:bg-blue-900/40 transition-colors shadow-lg shadow-blue-950/20"
                  >
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-800/70 rounded-full h-10 w-10 flex items-center justify-center shadow-inner">
                        <span className="text-white font-bold">{companyName?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-white font-medium">{companyName}</h3>
                        <p className="text-blue-300 text-sm">{connection.company_share_id}</p>
                      </div>
                    </div>
                    <div className="text-blue-200 text-sm">
                      Connected: <span className="font-medium">{new Date(connection.connected_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
              {associatedCompanies.length > 3 && (
                <Link
                  to={ROUTES.PROTECTED.VENDOR.COMPANIES}
                  className="bg-blue-950/40 backdrop-blur-sm border border-blue-700/30 border-dashed rounded-lg p-6 flex items-center justify-center hover:bg-blue-900/30 transition-colors shadow-lg shadow-blue-950/20"
                >
                  <span className="text-blue-300">View All Companies</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
