import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Link } from 'react-router-dom';

// Mock data for demo purposes - replace with actual contract calls
const MOCK_LISTINGS = [
  {
    id: 1,
    companyId: 'COMP-1234',
    companyName: 'Tech Solutions Inc.',
    title: 'Industrial Supplies Procurement',
    description: 'Looking for bulk industrial cleaning supplies with eco-friendly certification. We need a reliable supplier who can provide consistent quality and timely delivery. Products must meet environmental standards.',
    quantity: 500,
    maxPrice: 25000,
    isPublic: true,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    bidSubmitted: false
  },
  {
    id: 2,
    companyId: 'COMP-5678',
    companyName: 'Global Manufacturing',
    title: 'Office Furniture',
    description: 'Need ergonomic office chairs for our new headquarters. Looking for high-quality, comfortable chairs suitable for long working hours. Prefer adjustable height and lumbar support features.',
    quantity: 50,
    maxPrice: 15000,
    isPublic: false,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    bidSubmitted: true,
    yourBid: 14000
  },
  {
    id: 3,
    companyId: 'COMP-9012',
    companyName: 'Innovative Corp',
    title: 'IT Hardware',
    description: 'Seeking laptops and monitors for remote team. Must be business-grade laptops with minimum i5 processors, 16GB RAM and 512GB SSD. Monitors should be at least 24" with adjustable height stands.',
    quantity: 25,
    maxPrice: 50000,
    isPublic: true,
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'closed',
    bidSubmitted: true,
    yourBid: 47500
  },
  {
    id: 4,
    companyId: 'COMP-5678',
    companyName: 'Global Manufacturing',
    title: 'Industrial Printers',
    description: 'Need industrial-grade printers for manufacturing floor. Must be durable and capable of handling harsh environments with dust and occasional moisture.',
    quantity: 10,
    maxPrice: 20000,
    isPublic: false,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    bidSubmitted: false
  },
  {
    id: 5,
    companyId: 'COMP-1234',
    companyName: 'Tech Solutions Inc.',
    title: 'Network Equipment',
    description: 'Looking for enterprise network switches and routers for new data center deployment. Must be compatible with existing Cisco infrastructure.',
    quantity: 15,
    maxPrice: 35000,
    isPublic: true,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    bidSubmitted: false
  }
];

const VendorListings: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterBidStatus, setFilterBidStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // In a real app, you'd fetch this data from the blockchain
    // For now, we're using mock data
    const fetchListings = async () => {
      try {
        // Mock data loading
        setListings(MOCK_LISTINGS);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchListings();
  }, []);
  
  useEffect(() => {
    // Apply filters
    let result = [...listings];
    
    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(listing => listing.status === filterStatus);
    }
    
    // Filter by bid status
    if (filterBidStatus === 'bid') {
      result = result.filter(listing => listing.bidSubmitted);
    } else if (filterBidStatus === 'nobid') {
      result = result.filter(listing => !listing.bidSubmitted);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        listing => 
          listing.title.toLowerCase().includes(term) ||
          listing.description.toLowerCase().includes(term) ||
          listing.companyName.toLowerCase().includes(term) ||
          listing.companyId.toLowerCase().includes(term)
      );
    }
    
    setFilteredListings(result);
  }, [listings, filterStatus, filterBidStatus, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
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

        {filteredListings.length === 0 ? (
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
            {filteredListings.map((listing) => (
              <div 
                key={listing.id} 
                className={`bg-blue-800/20 backdrop-blur-sm border ${
                  listing.status === 'closed' 
                    ? 'border-blue-700/20' 
                    : listing.bidSubmitted 
                      ? 'border-green-700/40'
                      : 'border-blue-700/40'
                } rounded-lg p-6 hover:bg-blue-800/30 transition-colors`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-white">{listing.title}</h3>
                      
                      {listing.status === 'closed' ? (
                        <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">
                          Closed
                        </span>
                      ) : isExpired(listing.deadline) ? (
                        <span className="bg-red-900/50 text-red-300 text-xs px-2 py-1 rounded-full">
                          Expired
                        </span>
                      ) : (
                        <span className="bg-green-900/50 text-green-300 text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                      
                      {listing.isPublic ? (
                        <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded-full">
                          Public
                        </span>
                      ) : (
                        <span className="bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded-full">
                          Private
                        </span>
                      )}
                      
                      {listing.bidSubmitted && (
                        <span className="bg-teal-900/50 text-teal-300 text-xs px-2 py-1 rounded-full">
                          Bid: ${listing.yourBid}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-blue-300 text-sm">
                      From <span className="font-medium">{listing.companyName}</span> ({listing.companyId})
                    </p>
                    
                    <p className="text-blue-300 mt-2 line-clamp-2">{listing.description}</p>
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-blue-900/30 px-3 py-2 rounded-md">
                        <p className="text-xs text-blue-400">Quantity</p>
                        <p className="text-white">{listing.quantity}</p>
                      </div>
                      
                      <div className="bg-blue-900/30 px-3 py-2 rounded-md">
                        <p className="text-xs text-blue-400">Max Price</p>
                        <p className="text-white">${listing.maxPrice.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-blue-900/30 px-3 py-2 rounded-md">
                        <p className="text-xs text-blue-400">{listing.status === 'closed' ? 'Closed On' : 'Deadline'}</p>
                        <p className={`${isExpired(listing.deadline) && listing.status !== 'closed' ? 'text-red-400' : 'text-white'}`}>
                          {formatDate(listing.deadline)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-center justify-center">
                    {listing.status === 'active' && !isExpired(listing.deadline) ? (
                      <Link
                        to={`/dashboard/vendor/listing/${listing.id}`}
                        className={`${
                          listing.bidSubmitted 
                            ? 'bg-teal-700 hover:bg-teal-600'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                        } text-white px-6 py-3 rounded-lg shadow-md shadow-blue-950/20 transition duration-150 flex items-center`}
                      >
                        {listing.bidSubmitted ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Update Bid
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            Submit Bid
                          </>
                        )}
                      </Link>
                    ) : (
                      <Link
                        to={`/dashboard/vendor/listing/${listing.id}`}
                        className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-150"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VendorListings;
