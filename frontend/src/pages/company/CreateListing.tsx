import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormField from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { ROUTES } from '../../config/routes';

// Mock vendors for the demo
const MOCK_VENDORS = [
  { id: 1, address: '0x1234...5678', name: 'ABC Suppliers', status: 'approved' },
  { id: 2, address: '0x2345...6789', name: 'XYZ Corporation', status: 'approved' },
  { id: 3, address: '0x3456...7890', name: 'Global Ventures', status: 'approved' },
  { id: 4, address: '0x4567...8901', name: 'Tech Providers', status: 'approved' },
  { id: 5, address: '0x5678...9012', name: 'Quality Services', status: 'approved' },
    { id: 6, address: '', name: 'Make it Public', status: 'approved' }
];

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    maxPrice: '',
    isPublic: false,
    acceptCrypto: false,
    durationInDays: '7',
    category: '',
    deliveryTimeline: '',
    location: ''
  });
  
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [availableVendors, setAvailableVendors] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    // In a real app, fetch approved vendors from the blockchain
    const fetchVendors = async () => {
      try {
        // In the future, replace with actual contract call
        setAvailableVendors(MOCK_VENDORS);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        showToast({
          title: "Error",
          description: "Failed to load vendors. Please try again.",
          status: "error"
        });
      }
    };
    
    fetchVendors();
  }, [showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setAttachments(fileList);
    }
  };

  const toggleVendor = (vendorId: number) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }
    
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    
    if (!formData.maxPrice) {
      newErrors.maxPrice = 'Maximum price is required';
    } else if (isNaN(Number(formData.maxPrice)) || Number(formData.maxPrice) <= 0) {
      newErrors.maxPrice = 'Maximum price must be a positive number';
    }
    
    if (!formData.durationInDays) {
      newErrors.durationInDays = 'Duration is required';
    } else if (isNaN(Number(formData.durationInDays)) || Number(formData.durationInDays) <= 0) {
      newErrors.durationInDays = 'Duration must be a positive number of days';
    } else if (Number(formData.durationInDays) > 365) {
      newErrors.durationInDays = 'Duration cannot exceed 365 days';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.deliveryTimeline) {
      newErrors.deliveryTimeline = 'Delivery timeline is required';
    }
    
    // If not public, must select at least one vendor
    if (!formData.isPublic && selectedVendors.length === 0) {
      newErrors.vendors = 'You must select at least one vendor for a private listing';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.current_profile_type !== 'company') {
      showToast({
        title: "Error",
        description: "Only companies can create listings. Please switch to a company profile.",
        status: "error"
      });
      return;
    }
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const listingData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          base_price: formData.maxPrice ? Number(formData.maxPrice) : undefined,
          visibility: formData.isPublic ? 'public' : 'private',
          requirements: [
            `Quantity: ${formData.quantity}`,
            `Delivery Timeline: ${formData.deliveryTimeline}`,
            ...(formData.location ? [`Location: ${formData.location}`] : [])
          ],
          specifications: [
            `Duration: ${formData.durationInDays} days`,
            ...(formData.acceptCrypto ? ['Accepts cryptocurrency payments'] : [])
          ],
          blockchain_enabled: formData.acceptCrypto,
          accessible_vendor_ids: formData.isPublic ? undefined : selectedVendors
        };
        
        // Replace mock implementation with real API call
        // const response = await listingService.createListing(listingData);
        
        // For now, using mock success to test navigation
        console.log('Creating listing:', listingData);
        
        // Mock success response - replace with real API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showToast({
          title: "Success!",
          description: "Your listing has been created successfully and is now live.",
          status: "success"
        });
        
        // Add delay to allow database operation to complete, then navigate to listings page
        setTimeout(() => {
          navigate(ROUTES.PROTECTED.COMPANY.LISTINGS);
        }, 500);
        
      } catch (error: any) {
        console.error('Error creating listing:', error);
        
        showToast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to create listing. Please try again.",
          status: "error"
        });
        
        setErrors({ 
          submit: `Failed to create listing: ${error?.message || 'Please try again.'}`
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Create Product Listing</h1>
          <p className="text-blue-300">
            Create a new product listing for vendors to bid on. You can make it public or select specific vendors.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Listing Title"
                  id="title"
                  type="text"
                  placeholder="Enter a descriptive title"
                  required={true}
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                />
                
                <div>
                  <label htmlFor="category" className="block text-blue-200 text-sm font-medium mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={`w-full bg-blue-900/50 border ${
                      errors.category ? 'border-red-400' : 'border-blue-700'
                    } rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select a category</option>
                    <option value="raw-materials">Raw Materials</option>
                    <option value="electronics">Electronics</option>
                    <option value="machinery">Machinery & Equipment</option>
                    <option value="office-supplies">Office Supplies</option>
                    <option value="chemicals">Chemicals</option>
                    <option value="services">Services</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category}</p>}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-blue-200 text-sm font-medium mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed information about the product including specifications, requirements, and any other relevant details"
                  required
                  rows={4}
                  className={`w-full bg-blue-900/50 border ${
                    errors.description ? 'border-red-400' : 'border-blue-700'
                  } rounded-lg p-3 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Quantity"
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  required={true}
                  value={formData.quantity}
                  onChange={handleChange}
                  error={errors.quantity}
                />
                
                <FormField
                  label="Maximum Price ($)"
                  id="maxPrice"
                  type="number"
                  placeholder="Enter maximum price"
                  required={true}
                  value={formData.maxPrice}
                  onChange={handleChange}
                  error={errors.maxPrice}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Listing Duration (days)"
                  id="durationInDays"
                  type="number"
                  placeholder="Enter duration in days"
                  required={true}
                  value={formData.durationInDays}
                  onChange={handleChange}
                  error={errors.durationInDays}
                />
                
                <FormField
                  label="Delivery Timeline"
                  id="deliveryTimeline"
                  type="text"
                  placeholder="e.g., 2 weeks after order"
                  required={true}
                  value={formData.deliveryTimeline}
                  onChange={handleChange}
                  error={errors.deliveryTimeline}
                />
              </div>
              
              <FormField
                label="Location"
                id="location"
                type="text"
                placeholder="Delivery location"
                value={formData.location}
                onChange={handleChange}
                error={errors.location}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    id="isPublic"
                    name="isPublic"
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-500 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-blue-200">
                    Make listing public (available to all vendors)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="acceptCrypto"
                    name="acceptCrypto"
                    type="checkbox"
                    checked={formData.acceptCrypto}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-500 rounded"
                  />
                  <label htmlFor="acceptCrypto" className="ml-2 block text-sm text-blue-200">
                    Accept cryptocurrency payments
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Attachments (Specifications, Documents, etc.)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-blue-700 rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-blue-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-300">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-blue-900/40 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-blue-400">PDF, DOCX, XLSX, JPG, PNG up to 10MB each</p>
                  </div>
                </div>
                <div className="mt-2">
                  {attachments.length > 0 && (
                    <div className="text-sm text-blue-300">
                      {attachments.length} file(s) selected
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Vendor Selection */}
            {!formData.isPublic && (
              <div className="bg-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50">
                <h2 className="text-lg font-semibold text-white mb-4">Select Vendors</h2>
                {availableVendors.length === 0 ? (
                  <p className="text-blue-300">No approved vendors available.</p>
                ) : (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-blue-300 text-sm">
                        Select vendors who can see and bid on this listing
                      </p>
                      <p className="text-blue-300 text-sm">
                        Selected: <span className="font-semibold">{selectedVendors.length}</span> of {availableVendors.length}
                      </p>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {availableVendors.map(vendor => (
                        <div 
                          key={vendor.id} 
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedVendors.includes(vendor.id) 
                              ? 'bg-blue-700/50 border border-blue-500' 
                              : 'bg-blue-900/30 border border-blue-800 hover:bg-blue-800/30'
                          }`}
                          onClick={() => toggleVendor(vendor.id)}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedVendors.includes(vendor.id)}
                              onChange={() => {}}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-500 rounded"
                            />
                            <div className="ml-3">
                              <p className="text-white">{vendor.name}</p>
                              <p className="text-blue-300 text-xs">{vendor.address}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.vendors && <p className="mt-2 text-sm text-red-400">{errors.vendors}</p>}
                  </>
                )}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-lg shadow-md disabled:opacity-70 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Listing'
                )}
              </button>
            </div>
            
            {errors.submit && (
              <div className="text-center text-red-400 mt-4">{errors.submit}</div>
            )}
            </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateListing;
