import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom'; // TODO: Use when needed
import DashboardLayout from '../../components/layout/DashboardLayout';
// import { useAuth } from '../../context/AuthContext';

// Define bid type
interface Bid {
  id: number;
  blockchain_id: string;
  vendor_id: number;
  price: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  rank?: number; // Only the vendor's own rank will be available
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
  company_name: string;
  company_blockchain_id: string;
}

const VendorBidManager: React.FC = () => {
  // const { currentProfile } = useAuth();
  // const vendorProfile = currentProfile?.type === 'vendor' ? currentProfile : null;
  const { listingId } = useParams<{ listingId: string }>();
  // const navigate = useNavigate(); // TODO: Use when needed
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [existingBid, setExistingBid] = useState<Bid | null>(null);
  const [bidRank, setBidRank] = useState<number | null>(null);
  const [totalBids, setTotalBids] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    price: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchListingAndBid = async () => {
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
          company_name: "Tech Solutions Inc.",
          company_blockchain_id: "COMP-1234"
        };
        
        // Check if vendor already has a bid for this listing
        // In a real app, this would be fetched from your backend
        const mockBid: Bid | null = Math.random() > 0.5 ? {
          id: 123,
          blockchain_id: 'BID-123',
          vendor_id: 456,
          price: 22500,
          description: "Our offer includes premium eco-friendly cleaning supplies with delivery within 2 weeks.",
          status: 'pending',
          created_at: new Date().toISOString(),
          rank: 3 // Mock rank - in a real app this would come from backend
        } : null;
        
        setListing(mockListing);
        setExistingBid(mockBid);
        
        if (mockBid) {
          setBidRank(mockBid.rank || null);
          // Pre-fill form with existing bid data for editing
          setFormData({
            price: mockBid.price.toString(),
            description: mockBid.description
          });
        }
        
        // Mock total number of bids for this listing
        setTotalBids(8);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listing and bid:', err);
        setError('Failed to load listing details. Please try again later.');
        setLoading(false);
      }
    };

    fetchListingAndBid();
  }, [listingId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form data
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Please enter a valid price');
      }
      
      if (listing?.max_price && price > listing.max_price) {
        throw new Error(`Price cannot exceed the maximum price of ${formatCurrency(listing.max_price)}`);
      }
      
      if (!formData.description.trim()) {
        throw new Error('Please provide a description for your bid');
      }
      
      // In a real app, this would be an API call to create or update a bid
      console.log('Submitting bid:', {
        listingId: listing?.id,
        price,
        description: formData.description
      });
      
      // Mock successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the existing bid or create a new one in local state
      const newBid: Bid = {
        id: existingBid?.id || Math.floor(Math.random() * 1000),
        blockchain_id: existingBid?.blockchain_id || `BID-${Math.floor(Math.random() * 1000)}`,
        vendor_id: 456, // This would be the actual vendor ID in a real app
        price,
        description: formData.description,
        status: 'pending',
        created_at: new Date().toISOString(),
        rank: 2 // Mock rank - this would come from backend
      };
      
      setExistingBid(newBid);
      setBidRank(newBid.rank || null);
      setSuccess(existingBid ? 'Your bid has been updated successfully!' : 'Your bid has been submitted successfully!');
      
      // Redirect back to the vendor dashboard after a short delay
      // setTimeout(() => navigate('/dashboard/vendor'), 2000);
      
    } catch (err: any) {
      console.error('Error submitting bid:', err);
      setError(err.message || 'Failed to submit your bid. Please try again.');
    } finally {
      setSubmitting(false);
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

  if (error && !listing) {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">{error}</p>
          <Link to="/dashboard/vendor" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Back to Dashboard
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
          <Link to="/dashboard/vendor" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // If the listing is closed or cancelled and vendor has no bid, they can't submit one
  if ((listing.status === 'closed' || listing.status === 'cancelled') && !existingBid) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Listing Details */}
          <div className="bg-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{listing.title}</h1>
                <p className="text-blue-200 mb-2">From: {listing.company_name} ({listing.company_blockchain_id})</p>
                <p className="text-blue-200 mb-4">{listing.description}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm flex items-center ${
                listing.status === 'closed' ? 'bg-gray-900/50 text-gray-300' : 'bg-red-900/50 text-red-300'
              }`}>
                <span className={`h-2 w-2 rounded-full mr-2 ${
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
          
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6 text-center">
            <p className="text-blue-300 mb-4">
              This listing is no longer accepting bids.
            </p>
            <Link to="/dashboard/vendor" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Back to Dashboard
            </Link>
          </div>
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
              <p className="text-blue-200 mb-2">From: {listing.company_name} ({listing.company_blockchain_id})</p>
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
        
        {/* Existing Bid Status */}
        {existingBid && (
          <div className={`bg-blue-900/20 backdrop-blur-sm border ${
            existingBid.status === 'accepted' ? 'border-green-500' :
            existingBid.status === 'rejected' ? 'border-red-800/40' : 'border-blue-800/40'
          } rounded-lg p-6`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Your Bid</h2>
                <p className="text-blue-300 mb-4">{existingBid.description}</p>
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-blue-300 text-sm">Submitted</p>
                    <p className="text-white">{formatDate(existingBid.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Status</p>
                    <div className={`px-3 py-1 rounded-full text-sm inline-flex items-center ${
                      existingBid.status === 'accepted' ? 'bg-green-900/50 text-green-300' :
                      existingBid.status === 'rejected' ? 'bg-red-900/50 text-red-300' :
                      'bg-yellow-900/50 text-yellow-300'
                    }`}>
                      <span className={`h-2 w-2 rounded-full mr-2 ${
                        existingBid.status === 'accepted' ? 'bg-green-500' :
                        existingBid.status === 'rejected' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}></span>
                      <span className="capitalize">{existingBid.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0">
                <div className="text-3xl font-bold text-white text-right">{formatCurrency(existingBid.price)}</div>
                {bidRank !== null && (
                  <div className="flex items-center justify-end mt-2">
                    <div className="bg-blue-700/50 rounded-full px-3 py-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-blue-200 text-sm">
                        {bidRank === 1 ? 'Lowest Bid!' : `Rank: ${bidRank} of ${totalBids}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Bid Submission Form */}
        {listing.status === 'active' && (
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {existingBid ? 'Update Your Bid' : 'Submit Your Bid'}
            </h2>
            
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="block text-blue-300 mb-2">Your Price (USD)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter your price"
                  className="w-full bg-blue-900/30 border border-blue-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0.01"
                  max={listing.max_price || undefined}
                  required
                />
                {listing.max_price && (
                  <p className="text-blue-300 text-sm mt-1">
                    Maximum allowed price: {formatCurrency(listing.max_price)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-blue-300 mb-2">Bid Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your offer, including delivery timeline, specifications, and any additional services"
                  rows={4}
                  className="w-full bg-blue-900/30 border border-blue-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  )}
                  {existingBid ? 'Update Bid' : 'Submit Bid'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="flex justify-between">
          <Link to="/dashboard/vendor" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Back to Dashboard
          </Link>
          
          {existingBid && listing.status === 'active' && (
            <button 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              // onClick={handleCancelBid}
            >
              Cancel Bid
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorBidManager;
