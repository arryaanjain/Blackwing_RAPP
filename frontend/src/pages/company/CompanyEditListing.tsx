import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import { ROUTES } from '../../config/routes';
import type { Listing, CreateListingData, ListingFormData } from '../../types/listings';

const CompanyEditListing: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const [requirementInput, setRequirementInput] = useState('');
  const [specificationInput, setSpecificationInput] = useState('');

  // Categories for dropdown
  const categories = [
    'Software Development',
    'Web Development',
    'Mobile Development',
    'Design & Creative',
    'Marketing & Advertising',
    'Content Writing',
    'Data Analysis',
    'Consulting',
    'Legal Services',
    'Accounting & Finance',
    'Engineering',
    'Manufacturing',
    'Logistics & Supply Chain',
    'Construction',
    'Healthcare Services',
    'Education & Training',
    'Other'
  ];

  useEffect(() => {
    if (listingId) {
      loadListing();
    }
  }, [listingId]);

  const loadListing = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingService.getListing(parseInt(listingId!));
      const listingData = response.data;

      // Check if user owns this listing
      if (listingData.company_id !== user?.current_profile_id) {
        setError('You do not have permission to edit this listing');
        return;
      }

      setListing(listingData);

      // Populate form with existing data
      setFormData({
        title: listingData.title,
        description: listingData.description,
        category: listingData.category,
        base_price: listingData.base_price,
        visibility: listingData.visibility,
        requirements: listingData.requirements || [],
        specifications: listingData.specifications || [],
        closes_at: listingData.closes_at ? new Date(listingData.closes_at).toISOString().slice(0, 16) : '',
        blockchain_enabled: listingData.blockchain_enabled,
        accessible_vendor_ids: [],
        errors: {}
      });

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ListingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      errors: prev.errors ? { ...prev.errors, [field]: [] } : {}
    }));
  };

  const addRequirement = () => {
    if (requirementInput.trim() && !(formData.requirements || []).includes(requirementInput.trim())) {
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
      requirements: (prev.requirements || []).filter((_, i) => i !== index)
    }));
  };

  const addSpecification = () => {
    if (specificationInput.trim() && !(formData.specifications || []).includes(specificationInput.trim())) {
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
      specifications: (prev.specifications || []).filter((_, i) => i !== index)
    }));
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

    if (formData.base_price !== undefined && formData.base_price < 0) {
      errors.base_price = ['Base price cannot be negative'];
    }

    setFormData(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !listing) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData: CreateListingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        base_price: formData.base_price,
        visibility: formData.visibility,
        requirements: formData.requirements,
        specifications: formData.specifications,
        closes_at: formData.closes_at ? new Date(formData.closes_at).toISOString() : undefined,
        blockchain_enabled: formData.blockchain_enabled,
        accessible_vendor_ids: formData.accessible_vendor_ids
      };

      await listingService.updateListing(listing.id, updateData);

      // Add delay to allow database operation to complete
      setTimeout(() => {
        navigate(`/company/listings/${listing.id}`);
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (user?.current_profile_type !== 'company') {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">Only companies can edit listings. Please switch to a company profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !listing) {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">{error || 'Listing not found'}</p>
          <Link
            to={ROUTES.PROTECTED.COMPANY.LISTINGS}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Listings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                to={`/company/listings/${listing.id}`}
                className="text-blue-300 hover:text-blue-100"
              >
                ← Back to Listing
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Edit Listing</h1>
            <p className="text-blue-300">Update your procurement listing details</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter listing title..."
                  required
                />
                {formData.errors?.title && (
                  <p className="mt-1 text-sm text-red-300">{formData.errors.title[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category...</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {formData.errors?.category && (
                  <p className="mt-1 text-sm text-red-300">{formData.errors.category[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Base Price (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.base_price || ''}
                    onChange={(e) => handleInputChange('base_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  {formData.errors?.base_price && (
                    <p className="mt-1 text-sm text-red-300">{formData.errors.base_price[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => handleInputChange('visibility', e.target.value as 'public' | 'private')}
                    className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what you're looking for, project scope, deliverables, etc..."
                  required
                />
                {formData.errors?.description && (
                  <p className="mt-1 text-sm text-red-300">{formData.errors.description[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Timeline</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Closes At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.closes_at}
                  onChange={(e) => handleInputChange('closes_at', e.target.value)}
                  className="w-full p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.errors?.closes_at && (
                  <p className="mt-1 text-sm text-red-300">{formData.errors.closes_at[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>

            <div className="space-y-4">
              <div className="flex gap-2">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium whitespace-nowrap"
                >
                  Add Requirement
                </button>
              </div>

              {(formData.requirements || []).length > 0 && (
                <div className="space-y-2">
                  {(formData.requirements || []).map((requirement, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-800/20 border border-blue-700/30 rounded-lg p-3">
                      <span className="text-blue-100">{requirement}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-red-300 hover:text-red-100 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Specifications</h2>

            <div className="space-y-4">
              <div className="flex gap-2">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium whitespace-nowrap"
                >
                  Add Specification
                </button>
              </div>

              {(formData.specifications || []).length > 0 && (
                <div className="space-y-2">
                  {(formData.specifications || []).map((specification, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-800/20 border border-blue-700/30 rounded-lg p-3">
                      <span className="text-blue-100">{specification}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="text-red-300 hover:text-red-100 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Blockchain */}
          <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Blockchain Options</h2>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="blockchain_enabled"
                checked={formData.blockchain_enabled}
                onChange={(e) => handleInputChange('blockchain_enabled', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
              />
              <div>
                <label htmlFor="blockchain_enabled" className="text-blue-200 font-medium cursor-pointer">
                  Enable Blockchain Recording
                </label>
                <p className="text-blue-300 text-sm mt-1">
                  Record this listing on the blockchain for enhanced transparency and immutable record keeping.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Link
              to={`/company/listings/${listing.id}`}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium"
            >
              {saving ? 'Updating...' : 'Update Listing'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CompanyEditListing;
