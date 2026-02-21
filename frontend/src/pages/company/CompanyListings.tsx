import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
// import { useAuth } from '../../context/AuthContext'; // TODO: Use when needed

// Define listing type
interface Listing {
  id: number;
  blockchain_id: string;
  title: string;
  description: string;
  quantity: number;
  max_price: number;
  is_private: boolean;
  deadline: string;
  status: 'active' | 'closed' | 'cancelled';
  created_at: string;
  bid_count: number;
}

const CompanyListings: React.FC = () => {
  // const { currentProfile } = useAuth(); // TODO: Use when needed
  // const companyProfile = currentProfile?.type === 'company' ? currentProfile : null; // TODO: Use when needed
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'closed' | 'all'>('active');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call to fetch listings
        // Mock data for demonstration
        const mockListings: Listing[] = [
          {
            id: 1,
            blockchain_id: 'LIST-001',
            title: 'Industrial Supplies Procurement',
            description: 'Looking for bulk industrial cleaning supplies with eco-friendly certification.',
            quantity: 500,
            max_price: 25000,
            is_private: false,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            created_at: new Date().toISOString(),
            bid_count: 5
          },
          {
            id: 2,
            blockchain_id: 'LIST-002',
            title: 'Office Furniture',
            description: 'Need ergonomic office chairs for our new headquarters.',
            quantity: 50,
            max_price: 15000,
            is_private: true,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            created_at: new Date().toISOString(),
            bid_count: 3
          },
          {
            id: 3,
            blockchain_id: 'LIST-003',
            title: 'IT Hardware',
            description: 'Seeking laptops and monitors for remote team.',
            quantity: 25,
            max_price: 50000,
            is_private: false,
            deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'closed',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            bid_count: 8
          },
          {
            id: 4,
            blockchain_id: 'LIST-004',
            title: 'Marketing Services',
            description: 'Looking for digital marketing agency for Q4 campaign.',
            quantity: 1,
            max_price: 35000,
            is_private: false,
            deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'closed',
            created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            bid_count: 12
          },
          {
            id: 5,
            blockchain_id: 'LIST-005',
            title: 'Catering Services',
            description: 'Need catering for company event.',
            quantity: 1,
            max_price: 5000,
            is_private: true,
            deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'cancelled',
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            bid_count: 2
          }
        ];
        
        setListings(mockListings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing => {
    if (activeTab === 'active') return listing.status === 'active';
    if (activeTab === 'closed') return listing.status === 'closed' || listing.status === 'cancelled';
    return true; // 'all' tab
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      case 'active':
        return {
          bg: 'bg-green-900/50',
          text: 'text-green-300',
          dot: 'bg-green-500'
        };
      case 'closed':
        return {
          bg: 'bg-gray-900/50',
          text: 'text-gray-300',
          dot: 'bg-gray-500'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-900/50',
          text: 'text-red-300',
          dot: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-blue-900/50',
          text: 'text-blue-300',
          dot: 'bg-blue-500'
        };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Your Listings</h1>
              <p className="text-blue-200">
                Manage all your procurement listings and track bids
              </p>
            </div>
            <Link
              to="/company/listings/create"
              className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center md:justify-start"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Listing
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-blue-800">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              className={`${
                activeTab === 'active'
                  ? 'border-b-2 border-blue-500 text-blue-300'
                  : 'text-blue-500 hover:text-blue-300'
              } py-2 px-1 font-medium`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button
              className={`${
                activeTab === 'closed'
                  ? 'border-b-2 border-blue-500 text-blue-300'
                  : 'text-blue-500 hover:text-blue-300'
              } py-2 px-1 font-medium`}
              onClick={() => setActiveTab('closed')}
            >
              Closed
            </button>
            <button
              className={`${
                activeTab === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-300'
                  : 'text-blue-500 hover:text-blue-300'
              } py-2 px-1 font-medium`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
          </nav>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-8 text-center">
            <p className="text-blue-300 mb-4">
              {activeTab === 'active'
                ? "You don't have any active listings."
                : activeTab === 'closed'
                ? "You don't have any closed listings."
                : "You haven't created any listings yet."}
            </p>
            <Link
              to="/company/listings/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-block"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => {
              const statusColors = getStatusColor(listing.status);
              const isExpired =
                new Date(listing.deadline).getTime() < Date.now() &&
                listing.status === 'active';

              return (
                <div
                  key={listing.id}
                  className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6 hover:bg-blue-800/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {listing.title}
                      </h3>
                      <p className="text-blue-300 mt-1 truncate max-w-lg">
                        {listing.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="text-blue-200 text-sm">
                          Quantity: <span className="font-medium">{listing.quantity}</span>
                        </span>
                        <span className="text-blue-200 text-sm">
                          Max Price:{' '}
                          <span className="font-medium">
                            {formatCurrency(listing.max_price)}
                          </span>
                        </span>
                        <span className="text-blue-200 text-sm">
                          Visibility:{' '}
                          <span className="font-medium">
                            {listing.is_private ? 'Private' : 'Public'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                      <div
                        className={`px-3 py-1 rounded-full text-sm flex items-center ${
                          isExpired
                            ? 'bg-yellow-900/50 text-yellow-300'
                            : statusColors.bg + ' ' + statusColors.text
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full mr-2 ${
                            isExpired ? 'bg-yellow-500' : statusColors.dot
                          }`}
                        ></span>
                        <span>
                          {isExpired ? 'Expired' : listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex items-center text-blue-300 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>
                          {listing.bid_count} {listing.bid_count === 1 ? 'bid' : 'bids'}
                        </span>
                      </div>

                      <span className="text-blue-300 text-sm">
                        {listing.status === 'active'
                          ? `Ends: ${formatDate(listing.deadline)}`
                          : `Created: ${formatDate(listing.created_at)}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/company/listings/${listing.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      View Details →
                    </Link>
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

export default CompanyListings;
