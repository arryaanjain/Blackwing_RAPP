import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

// Define bid type
interface Bid {
  id: number;
  blockchain_id: string;
  vendor_name: string;
  vendor_blockchain_id: string;
  price: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

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
  company_id: number;
}

const CompanyBidViewer: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListingAndBids = async () => {
      setLoading(true);
      try {
        // In a real app, these would be API calls to your backend
        // Mock data for demonstration
        
        // Mock fetch listing
        const mockListing: Listing = {
          id: parseInt(listingId!),
          blockchain_id: `LIST-${listingId}`,
          title: "Industrial Supplies Procurement",
          description: "Looking for bulk industrial cleaning supplies with eco-friendly certification.",
          quantity: 500,
          max_price: 25000,
          is_private: false,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          created_at: new Date().toISOString(),
          company_id: 1
        };
        
        // Mock fetch bids
        const mockBids: Bid[] = [
          {
            id: 1,
            blockchain_id: 'BID-001',
            vendor_name: 'Eco Supplies Co.',
            vendor_blockchain_id: 'VEND-001',
            price: 21500,
            description: 'High-quality eco-friendly cleaning supplies with quick delivery.',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            blockchain_id: 'BID-002',
            vendor_name: 'Green Clean Ltd.',
            vendor_blockchain_id: 'VEND-002',
            price: 19800,
            description: 'Certified eco-friendly supplies with 3-year warranty.',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            blockchain_id: 'BID-003',
            vendor_name: 'Sustainable Solutions',
            vendor_blockchain_id: 'VEND-003',
            price: 23400,
            description: 'Premium biodegradable cleaning products with training included.',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 4,
            blockchain_id: 'BID-004',
            vendor_name: 'Clean & Green',
            vendor_blockchain_id: 'VEND-004',
            price: 18750,
            description: 'Affordable eco-friendly solutions with bulk discount.',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 5,
            blockchain_id: 'BID-005',
            vendor_name: 'EcoClean Suppliers',
            vendor_blockchain_id: 'VEND-005',
            price: 24100,
            description: 'High-concentration products requiring less quantity.',
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ];
        
        setListing(mockListing);
        
        // Sort bids by price (ascending)
        const sortedBids = [...mockBids].sort((a, b) => a.price - b.price);
        
        // Limit to top 10 bids
        setBids(sortedBids.slice(0, 10));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listing and bids:', err);
        setError('Failed to load listing details and bids. Please try again later.');
        setLoading(false);
      }
    };

    fetchListingAndBids();
  }, [listingId]);

  const handleAcceptBid = async (bidId: number) => {
    // In a real app, this would be an API call to accept a bid
    try {
      // Mock API call
      console.log(`Accepting bid with ID: ${bidId}`);
      
      // Update the bid status locally
      setBids(bids.map(bid => 
        bid.id === bidId 
          ? { ...bid, status: 'accepted' as const } 
          : { ...bid, status: 'rejected' as const }
      ));
      
      // Also update the listing status
      if (listing) {
        setListing({
          ...listing,
          status: 'closed' as const
        });
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
    }
  };

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
          <Link to="/company/listings" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
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
          <Link to="/company/listings" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
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
            <div className={`px-3 py-1 rounded-full text-sm flex items-center ${
              listing.status === 'active' 
                ? 'bg-green-900/50 text-green-300' 
                : listing.status === 'closed'
                ? 'bg-gray-900/50 text-gray-300'
                : 'bg-red-900/50 text-red-300'
            }`}>
              <span className={`h-2 w-2 rounded-full mr-2 ${
                listing.status === 'active' ? 'bg-green-500' : 
                listing.status === 'closed' ? 'bg-gray-500' : 'bg-red-500'
              }`}></span>
              <span className="capitalize">{listing.status}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-blue-300 text-sm">Quantity</p>
              <p className="text-white font-medium">{listing.quantity}</p>
            </div>
            <div>
              <p className="text-blue-300 text-sm">Max Price</p>
              <p className="text-white font-medium">{formatCurrency(listing.max_price)}</p>
            </div>
            <div>
              <p className="text-blue-300 text-sm">Deadline</p>
              <p className="text-white font-medium">{formatDate(listing.deadline)}</p>
            </div>
            <div>
              <p className="text-blue-300 text-sm">Visibility</p>
              <p className="text-white font-medium">{listing.is_private ? 'Private' : 'Public'}</p>
            </div>
          </div>
        </div>
        
        {/* Bids Section */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Bids ({bids.length})
            <span className="text-sm font-normal text-blue-300 ml-2">
              Showing the top {Math.min(10, bids.length)} bids by price
            </span>
          </h2>
          
          {bids.length === 0 ? (
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6 text-center">
              <p className="text-blue-300">No bids have been submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bids.map((bid, index) => (
                <div 
                  key={bid.id}
                  className={`bg-blue-900/20 backdrop-blur-sm border ${
                    bid.status === 'accepted' ? 'border-green-500' :
                    bid.status === 'rejected' ? 'border-red-800/40' : 'border-blue-800/40'
                  } rounded-lg p-6 hover:bg-blue-800/30 transition-colors`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="bg-blue-700 text-white text-xs px-2 py-1 rounded-full mr-2">
                          #{index + 1}
                        </span>
                        <h3 className="text-lg font-medium text-white">{bid.vendor_name}</h3>
                        <span className="text-blue-300 text-sm ml-2">({bid.vendor_blockchain_id})</span>
                      </div>
                      <p className="text-blue-300 mt-1">{bid.description}</p>
                      <p className="text-blue-400 text-sm mt-2">
                        Submitted on {formatDate(bid.created_at)}
                      </p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                      <div className="text-2xl font-bold text-white">{formatCurrency(bid.price)}</div>
                      <div className={`mt-2 px-3 py-1 rounded-full text-sm flex items-center ${
                        bid.status === 'accepted' ? 'bg-green-900/50 text-green-300' :
                        bid.status === 'rejected' ? 'bg-red-900/50 text-red-300' :
                        'bg-yellow-900/50 text-yellow-300'
                      }`}>
                        <span className={`h-2 w-2 rounded-full mr-2 ${
                          bid.status === 'accepted' ? 'bg-green-500' :
                          bid.status === 'rejected' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></span>
                        <span className="capitalize">{bid.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  {listing.status === 'active' && bid.status === 'pending' && (
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => handleAcceptBid(bid.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      >
                        Accept Bid
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <Link to="/company/listings" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Back to Listings
          </Link>
          
          {listing.status === 'active' && (
            <button 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              // onClick={handleCancelListing}
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
