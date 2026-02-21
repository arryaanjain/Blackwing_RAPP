import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import listingService from '../../services/listingService';
import connectionService from '../../services/connectionService';
import type { Listing } from '../../types/listings';

const CompanyDashboard: React.FC = () => {
  const { currentProfile } = useAuth();
  const companyProfile = currentProfile?.type === 'company' ? currentProfile : null;
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [pendingVendorRequests, setPendingVendorRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeBids: 0,
    totalVendors: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [allListingsRes, activeListingsRes, connectionsRes, requestsRes] = await Promise.all([
          listingService.getListings({}, 1),                    // All listings — for total count
          listingService.getListings({ status: 'active' }, 1), // Active listings — for display
          connectionService.getConnections(),                   // Connected vendors count
          connectionService.getCompanyRequests()                // Pending vendor requests
        ]);

        const allListings = allListingsRes.data;
        const activeListingsData = activeListingsRes.data;

        setActiveListings(activeListingsData.data);

        // Count all quotes across active listings (active bids)
        const totalActiveBids = activeListingsData.data.reduce(
          (sum, listing) => sum + (listing.quotes?.length || 0), 0
        );

        // Count pending connection requests
        const pendingCount = (requestsRes as any).requests?.filter(
          (req: any) => req.status === 'pending'
        ).length || 0;

        setPendingVendorRequests(pendingCount);
        setStats({
          totalListings: allListings.total,
          activeBids: totalActiveBids,
          totalVendors: (connectionsRes as any).connections?.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
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
        <div className="bg-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome, {companyProfile?.company_name || companyProfile?.name}</h1>
          <p className="text-blue-200">
            Your company ID is <span className="font-semibold">{companyProfile?.id}</span>. Share this with vendors to allow them to connect with your company.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg shadow-lg p-6 border border-blue-600">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-600 bg-opacity-30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-blue-300 text-sm font-medium uppercase">Total Listings</p>
                <p className="text-white text-2xl font-semibold">{stats.totalListings}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-700 to-indigo-800 rounded-lg shadow-lg p-6 border border-indigo-600">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-600 bg-opacity-30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-blue-300 text-sm font-medium uppercase">Active Bids</p>
                <p className="text-white text-2xl font-semibold">{stats.activeBids}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-700 to-purple-800 rounded-lg shadow-lg p-6 border border-purple-600">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-600 bg-opacity-30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-blue-300 text-sm font-medium uppercase">Total Vendors</p>
                <p className="text-white text-2xl font-semibold">{stats.totalVendors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS_CREATE} className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-800 transition duration-200">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-white font-medium">Create New Listing</span>
            </div>
          </Link>

          <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS} className="flex items-center justify-center p-6 bg-gradient-to-r from-green-600 to-teal-700 rounded-lg shadow-md hover:from-green-700 hover:to-teal-800 transition duration-200">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-white font-medium">Manage Listings</span>
            </div>
          </Link>

          <Link to={ROUTES.PROTECTED.COMPANY.VENDORS} className="flex items-center justify-center p-6 bg-gradient-to-r from-purple-600 to-pink-700 rounded-lg shadow-md hover:from-purple-700 hover:to-pink-800 transition duration-200">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-white font-medium">Manage Vendors</span>
              {pendingVendorRequests > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                  {pendingVendorRequests}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Active Listings */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Active Listings</h2>
          {loading ? (
            <div className="bg-blue-800/20 backdrop-blur-sm border border-blue-700/40 rounded-lg p-8 text-center">
              <p className="text-blue-300">Loading listings...</p>
            </div>
          ) : activeListings.length === 0 ? (
            <div className="bg-blue-800/20 backdrop-blur-sm border border-blue-700/40 rounded-lg p-8 text-center">
              <p className="text-blue-300">You don't have any active listings yet.</p>
              <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS_CREATE} className="mt-4 inline-block bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Create Your First Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeListings.map((listing: Listing) => (
                <div
                  key={listing.id}
                  className="bg-blue-800/20 backdrop-blur-sm border border-blue-700/40 rounded-lg p-6 hover:bg-blue-800/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">{listing.title}</h3>
                      <p className="text-blue-300 mt-1 truncate max-w-lg">{listing.description}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        {listing.base_price && (
                          <span className="text-blue-200 text-sm">
                            Max Price: <span className="font-medium">${listing.base_price.toLocaleString()}</span>
                          </span>
                        )}
                        <span className="text-blue-200 text-sm">
                          Visibility: <span className="font-medium capitalize">{listing.visibility}</span>
                        </span>
                        <span className="text-blue-200 text-sm">
                          Category: <span className="font-medium">{listing.category}</span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                      <div className="bg-blue-900/50 px-3 py-1 rounded-full text-blue-200 text-sm flex items-center">
                        <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                        <span>Quotes: {listing.quotes?.length || 0}</span>
                      </div>
                      <span className="text-blue-300 text-sm mt-2">
                        Ends: {formatDate(listing.closes_at)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link to={ROUTES.PROTECTED.COMPANY.LISTINGS_DETAIL.replace(':listingId', listing.id.toString())} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
