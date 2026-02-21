import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import httpClient from '../../services/httpClient';
import type { CreateListingData, ListingFormData } from '../../types/listings';

const CompanyCreateListing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    category: '',
    base_price: undefined,
    visibility: 'public',
    requirements: [],
    specifications: [],
    closes_at: '',
    blockchain_enabled: false,
    accessible_vendor_ids: [],
    errors: {}
  });

  const [loading, setLoading] = useState(false);
  const [requirementInput, setRequirementInput] = useState('');
  const [specificationInput, setSpecificationInput] = useState('');
  const [availableVendors, setAvailableVendors] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Categories for dropdown
  const categories = [
    'Software Development',
    'Marketing & Advertising',
    'Design & Creative',
    'Engineering & Manufacturing',
    'Legal & Compliance',
    'Financial Services',
    'Consulting',
    'Construction',
    'Healthcare',
    'Education & Training',
    'Other'
  ];

  // Load connected vendors when component mounts
  useEffect(() => {
    loadConnectedVendors();
  }, []);

  const loadConnectedVendors = async () => {
    try {
      setLoadingVendors(true);
      const response = await httpClient.get('/api/connections');
      setAvailableVendors(response.data.connections || []);
    } catch (error) {
      console.error('Failed to load connected vendors:', error);
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[name];

      return {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked
          : type === 'number' ? (value ? parseFloat(value) : undefined)
            : value,
        errors: newErrors
      };
    });
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...(prev.requirements || []), requirementInput.trim()]
      }));
      setRequirementInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || []
    }));
  };

  const addSpecification = () => {
    if (specificationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: [...(prev.specifications || []), specificationInput.trim()]
      }));
      setSpecificationInput('');
    }
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications?.filter((_, i) => i !== index) || []
    }));
  };

  const handleVendorSelection = (vendorId: number) => {
    setFormData(prev => {
      const currentVendors = prev.accessible_vendor_ids || [];
      const newVendors = currentVendors.includes(vendorId)
        ? currentVendors.filter(id => id !== vendorId)
        : [...currentVendors, vendorId];

      return {
        ...prev,
        accessible_vendor_ids: newVendors
      };
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};

    if (!formData.title.trim()) {
      errors.title = ['Title is required'];
    }

    if (!formData.description.trim()) {
      errors.description = ['Description is required'];
    }

    if (!formData.category) {
      errors.category = ['Category is required'];
    }

    if (formData.visibility === 'private' && (!formData.accessible_vendor_ids || formData.accessible_vendor_ids.length === 0)) {
      errors.accessible_vendor_ids = ['Please select at least one vendor for private listings'];
    }

    setFormData(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData: CreateListingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        base_price: formData.base_price,
        visibility: formData.visibility,
        requirements: formData.requirements?.length ? formData.requirements : undefined,
        specifications: formData.specifications?.length ? formData.specifications : undefined,
        closes_at: formData.closes_at || undefined,
        blockchain_enabled: formData.blockchain_enabled,
        accessible_vendor_ids: formData.accessible_vendor_ids?.length ? formData.accessible_vendor_ids : undefined
      };

      const response = await listingService.createListing(submitData);

      // Add delay to allow database operation to complete
      setTimeout(() => {
        // Navigate to the created listing
        navigate(`/company/listings/${response.data.id}`);
      }, 500);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormData(prev => ({
          ...prev,
          errors: error.response.data.errors
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          errors: { general: [error.response?.data?.message || 'Failed to create listing'] }
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (user?.current_profile_type !== 'company') {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">Only companies can create listings. Please switch to a company profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/company/listings')}
            className="text-blue-300 hover:text-blue-100 mb-4 flex items-center gap-2"
          >
            ← Back to Listings
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Create New Listing</h1>
          <p className="text-blue-300">
            Create a new procurement listing to get quotes from vendors
          </p>
        </div>

        {formData.errors?.general && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
            {formData.errors.general.join(', ')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-blue-800/30 border rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.errors?.title ? 'border-red-400' : 'border-blue-700/50'
                    }`}
                  placeholder="Enter listing title..."
                />
                {formData.errors?.title && (
                  <p className="mt-1 text-sm text-red-300">{formData.errors.title.join(', ')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-blue-800/30 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.errors?.category ? 'border-red-400' : 'border-blue-700/50'
                    }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {formData.errors?.category && (
                  <p className="mt-1 text-sm text-red-300">{formData.errors.category.join(', ')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Base Price (Optional)
                </label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price || ''}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Visibility *
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="public">Public - Visible to all vendors</option>
                  <option value="private">Private - Only selected vendors</option>
                </select>
              </div>

              {/* Vendor Selection for Private Listings */}
              {formData.visibility === 'private' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Select Vendors *
                  </label>
                  {loadingVendors ? (
                    <div className="p-4 text-center text-blue-300">Loading connected vendors...</div>
                  ) : availableVendors.length === 0 ? (
                    <div className="p-4 bg-yellow-900/20 border border-yellow-800/40 rounded-lg text-yellow-300">
                      No connected vendors found. You need to have approved connections with vendors to create private listings.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-blue-700/50 rounded-lg p-3 bg-blue-900/20">
                      {availableVendors.map((connection) => (
                        <label key={connection.id} className="flex items-center p-2 hover:bg-blue-800/30 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.accessible_vendor_ids?.includes(connection.vendor.id) || false}
                            onChange={() => handleVendorSelection(connection.vendor.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded bg-blue-800/30"
                          />
                          <div className="ml-3">
                            <p className="text-white font-medium">
                              {connection.vendor.vendorProfile?.vendor_name || connection.vendor.name}
                            </p>
                            <p className="text-blue-300 text-sm">
                              {connection.vendor.vendorProfile?.specialization || 'General Services'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  {formData.errors?.accessible_vendor_ids && (
                    <p className="mt-1 text-sm text-red-300">{formData.errors.accessible_vendor_ids.join(', ')}</p>
                  )}
                </div>
              )}

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="blockchain_enabled"
                    checked={formData.blockchain_enabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded bg-blue-800/30"
                  />
                  <span className="ml-2 text-sm font-medium text-blue-200">
                    Enable blockchain verification
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className={`w-full p-3 bg-blue-800/30 border rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.errors?.description ? 'border-red-400' : 'border-blue-700/50'
                  }`}
                placeholder="Provide a detailed description of what you need..."
              />
              {formData.errors?.description && (
                <p className="mt-1 text-sm text-red-300">{formData.errors.description.join(', ')}</p>
              )}
            </div>
          </div>

          {/* Requirements Section */}
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  className="flex-1 p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a requirement..."
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Add
                </button>
              </div>

              {formData.requirements && formData.requirements.length > 0 && (
                <ul className="space-y-2">
                  {formData.requirements.map((req, index) => (
                    <li key={index} className="flex items-center justify-between bg-blue-800/20 p-3 rounded-lg">
                      <span className="text-blue-100">{req}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-red-300 hover:text-red-100"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Specifications Section */}
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Specifications</h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={specificationInput}
                  onChange={(e) => setSpecificationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
                  className="flex-1 p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a specification..."
                />
                <button
                  type="button"
                  onClick={addSpecification}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Add
                </button>
              </div>

              {formData.specifications && formData.specifications.length > 0 && (
                <ul className="space-y-2">
                  {formData.specifications.map((spec, index) => (
                    <li key={index} className="flex items-center justify-between bg-blue-800/20 p-3 rounded-lg">
                      <span className="text-blue-100">{spec}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="text-red-300 hover:text-red-100"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Timeline</h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Closes At (Optional - Leave empty for no expiration)
                </label>
                <input
                  type="datetime-local"
                  name="closes_at"
                  value={formData.closes_at}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-blue-800/30 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.errors?.closes_at ? 'border-red-400' : 'border-blue-700/50'
                    }`}
                />
                {formData.errors?.closes_at && (
                  <p className="mt-1 text-sm text-red-300">{formData.errors.closes_at.join(', ')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/company/listings')}
              className="px-6 py-3 border border-blue-600 text-blue-300 rounded-lg hover:bg-blue-900/30 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CompanyCreateListing;
