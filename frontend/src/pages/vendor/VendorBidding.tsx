import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { ROUTES } from '../../config/routes';

// Mock data for demo purposes - replace with actual contract calls
const MOCK_LISTINGS = [
  {
    id: 1,
    companyId: 'COMP-1234',
    companyName: 'Tech Solutions Inc.',
    title: 'Industrial Supplies Procurement',
    description: 'Looking for bulk industrial cleaning supplies with eco-friendly certification.',
    quantity: 500,
    maxPrice: 25000,
    isPublic: true,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    bidSubmitted: false,
    detailedDescription: 'We are seeking eco-friendly industrial cleaning supplies for our manufacturing facilities across the country. The products must meet ISO 14001 certification standards and be delivered within 30 days of order confirmation. Bulk packaging is preferred to minimize waste.',
    attachments: ['specifications.pdf', 'requirements.docx'],
    category: 'Supplies',
    deliveryLocation: 'Multiple locations (see specifications)'
  },
  {
    id: 2,
    companyId: 'COMP-5678',
    companyName: 'Global Manufacturing',
    title: 'Office Furniture',
    description: 'Need ergonomic office chairs for our new headquarters.',
    quantity: 50,
    maxPrice: 15000,
    isPublic: false,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    bidSubmitted: true,
    yourBid: 12500,
    yourProposedTimeline: '3 weeks delivery',
    detailedDescription: 'Our company is moving to a new headquarters and we need high-quality ergonomic office chairs for our staff. The chairs should be adjustable, provide proper lumbar support, and have a weight capacity of at least 250 lbs. We prefer chairs with a warranty of at least 5 years.',
    attachments: ['office_layout.pdf', 'chair_examples.jpg'],
    category: 'Furniture',
    deliveryLocation: '123 Corporate Plaza, Business City, ST 12345'
  },
  {
    id: 3,
    companyId: 'COMP-9012',
    companyName: 'Innovative Corp',
    title: 'IT Hardware',
    description: 'Seeking laptops and monitors for remote team.',
    quantity: 25,
    maxPrice: 50000,
    isPublic: true,
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'closed',
    bidSubmitted: true,
    yourBid: 47500,
    yourProposedTimeline: 'Immediate availability',
    detailedDescription: 'We need high-performance laptops and monitors for our remote development team. Laptops should have at least 16GB RAM, 512GB SSD, and an Intel i7 processor or equivalent. Monitors should be 27" with 4K resolution. All equipment must come with a 3-year warranty.',
    attachments: ['hardware_specs.pdf'],
    category: 'IT Equipment',
    deliveryLocation: 'Direct shipping to employee addresses (list will be provided)'
  }
];

interface BidFormData {
  price: string;
  timeline: string;
  notes: string;
}

const VendorBidding: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { currentProfile } = useAuth();
  const vendorProfile = currentProfile?.type === 'vendor' ? currentProfile : null;
  const { showToast } = useToast();

  const [listing, setListing] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<BidFormData>({
    price: '',
    timeline: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch listing details - replace with contract call in real app
    const fetchListingDetails = async () => {
      try {
        setIsLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Find the listing from mock data
        const foundListing = MOCK_LISTINGS.find(item => item.id === Number(listingId));

        if (foundListing) {
          setListing(foundListing);
        } else {
          showToast({
            title: "Error",
            description: "Listing not found",
            status: "error"
          });
          navigate(ROUTES.PROTECTED.VENDOR.LISTINGS);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        showToast({
          title: "Error",
          description: "Failed to load listing details",
          status: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingDetails();
  }, [listingId, navigate, showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.price) {
      newErrors.price = "Please enter your bid amount";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Bid amount must be a positive number";
    } else if (listing && Number(formData.price) > listing.maxPrice) {
      newErrors.price = `Bid cannot exceed the maximum price of ${listing.maxPrice}`;
    }

    if (!formData.timeline) {
      newErrors.timeline = "Please enter your proposed timeline";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real app, this would call the smart contract
      console.log("Submitting bid:", {
        listingId: listingId,
        vendorId: vendorProfile?.id || '',
        price: formData.price,
        timeline: formData.timeline,
        notes: formData.notes
      });

      showToast({
        title: "Success",
        description: "Your bid has been submitted successfully",
        status: "success"
      });

      // Update UI - in a real app this would be handled by event from contract
      if (listing) {
        setListing({
          ...listing,
          bidSubmitted: true,
          yourBid: Number(formData.price),
          yourProposedTimeline: formData.timeline
        });
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
      showToast({
        title: "Error",
        description: "Failed to submit your bid. Please try again.",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const updateBid = () => {
    // This would update the bid in a real application
    // For now just allow editing again
    if (listing) {
      setFormData({
        price: listing.yourBid?.toString() || '',
        timeline: listing.yourProposedTimeline || '',
        notes: listing.yourNotes || ''
      });

      setListing({
        ...listing,
        bidSubmitted: false
      });

      showToast({
        title: "Edit Mode",
        description: "You can now update your bid",
        status: "info"
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!listing) {
    return (
      <DashboardLayout>
        <div className="bg-red-900/30 backdrop-blur-sm border border-red-800/40 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-2">Listing Not Found</h2>
          <p className="text-red-300">The listing you're looking for does not exist or has been removed.</p>
          <button
            onClick={() => navigate(ROUTES.PROTECTED.VENDOR.LISTINGS)}
            className="mt-4 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Back to Listings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isExpired = new Date(listing.deadline) < new Date();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Listing Header */}
        <div className="bg-blue-950/60 backdrop-blur-sm rounded-xl p-6 border border-blue-800/40 shadow-lg shadow-blue-950/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
              <p className="text-blue-300 mt-1">Posted by {listing.companyName}</p>
            </div>
            <div className="bg-blue-900/50 py-2 px-4 rounded-lg shadow-inner shadow-blue-950/30">
              <p className="text-sm text-blue-300">Status</p>
              <p className={`font-semibold ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                {isExpired ? 'Expired' : 'Active'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-900/30 p-3 rounded-md">
              <p className="text-sm text-blue-300">Budget</p>
              <p className="text-white font-medium">Up to ${listing.maxPrice.toLocaleString()}</p>
            </div>
            <div className="bg-blue-900/30 p-3 rounded-md">
              <p className="text-sm text-blue-300">Quantity</p>
              <p className="text-white font-medium">{listing.quantity.toLocaleString()} units</p>
            </div>
            <div className="bg-blue-900/30 p-3 rounded-md">
              <p className="text-sm text-blue-300">Deadline</p>
              <p className="text-white font-medium">{formatDate(listing.deadline)}</p>
            </div>
          </div>
        </div>

        {/* Listing Details */}
        <div className="bg-blue-950/60 backdrop-blur-sm rounded-xl p-6 border border-blue-800/40 shadow-lg shadow-blue-950/20">
          <h2 className="text-xl font-semibold text-white mb-4">Listing Details</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-blue-300 text-sm mb-2">Description</h3>
              <p className="text-white">{listing.detailedDescription || listing.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-blue-300 text-sm mb-2">Category</h3>
                <p className="text-white">{listing.category || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-blue-300 text-sm mb-2">Delivery Location</h3>
                <p className="text-white">{listing.deliveryLocation || 'Not specified'}</p>
              </div>
            </div>

            {listing.attachments && listing.attachments.length > 0 && (
              <div>
                <h3 className="text-blue-300 text-sm mb-2">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.attachments.map((attachment: string, index: number) => (
                    <div
                      key={index}
                      className="bg-blue-900/50 px-3 py-2 rounded-md flex items-center text-sm text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {attachment}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bid Form or Bid Details */}
        <div className="bg-blue-950/60 backdrop-blur-sm rounded-xl p-6 border border-blue-800/40 shadow-lg shadow-blue-950/20">
          {!isExpired && !listing.bidSubmitted ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-4">Submit Your Bid</h2>
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div>
                  <label htmlFor="price" className="block text-blue-300 mb-2">
                    Your Bid Amount ($) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter your bid amount"
                    className={`w-full bg-blue-900/50 border ${errors.price ? 'border-red-400' : 'border-blue-700'
                      } rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-400">{errors.price}</p>}
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-blue-300 mb-2">
                    Proposed Timeline <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    placeholder="e.g., 2 weeks delivery"
                    className={`w-full bg-blue-900/50 border ${errors.timeline ? 'border-red-400' : 'border-blue-700'
                      } rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.timeline && <p className="mt-1 text-sm text-red-400">{errors.timeline}</p>}
                </div>

                <div>
                  <label htmlFor="notes" className="block text-blue-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Any additional information about your proposal"
                    className="w-full bg-blue-900/50 border border-blue-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-700 hover:bg-green-600 text-white py-2 px-6 rounded-md shadow-md shadow-green-900/50 disabled:opacity-70 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : 'Submit Bid'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Your Bid Details</h2>
                {!isExpired && (
                  <button
                    onClick={updateBid}
                    className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md shadow-blue-900/50 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Update Bid
                  </button>
                )}
              </div>

              {listing.bidSubmitted ? (
                <div className="bg-blue-900/30 rounded-lg p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-blue-300 text-sm mb-1">Your Bid Amount</h3>
                      <p className="text-white text-xl font-semibold">${listing.yourBid?.toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-blue-300 text-sm mb-1">Proposed Timeline</h3>
                      <p className="text-white">{listing.yourProposedTimeline}</p>
                    </div>
                  </div>

                  {listing.yourNotes && (
                    <div>
                      <h3 className="text-blue-300 text-sm mb-1">Your Notes</h3>
                      <p className="text-white">{listing.yourNotes}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-blue-300 text-sm mb-1">Bid Status</h3>
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-yellow-400 mr-2"></span>
                      <span className="text-white">Pending Review</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-900/30 rounded-lg p-5">
                  <div className="flex items-center text-yellow-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>This listing has expired and is no longer accepting bids.</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorBidding;
