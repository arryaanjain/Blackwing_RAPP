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
    opens_at: '',
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
        opens_at: formData.opens_at || undefined,
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
      <div className="space-y-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/company/listings')}
            className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white mb-8 flex items-center gap-2 transition-colors"
          >
            ← Back to Listings
          </button>
          <h1 className="text-3xl font-black text-white mb-4">Create New <span className="text-indigo-500">Listing</span></h1>
          <p className="text-gray-400 font-medium">
            Initialize a new procurement protocol node on the RAPP network.
          </p>
        </div>

        {formData.errors?.general && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{formData.errors.general.join(', ')}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Information */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-10 shadow-premium relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-12 px-2 border-l-2 border-indigo-500 ml-[-2px]">Basic Parameters</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                    Listing Designation *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-5 bg-white/5 border rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium backdrop-blur-sm ${formData.errors?.title ? 'border-red-500/50' : 'border-white/10'
                      }`}
                    placeholder="Enter protocol title..."
                  />
                  {formData.errors?.title && (
                    <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{formData.errors.title.join(', ')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                    Sector Classification *
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-5 bg-white/5 border rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium backdrop-blur-sm ${formData.errors?.category ? 'border-red-500/50' : 'border-white/10'
                        }`}
                    >
                      <option value="" className="bg-[#05070a]">Select Classification</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-[#05070a]">{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  {formData.errors?.category && (
                    <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{formData.errors.category.join(', ')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                    Base Valuation (Optional)
                  </label>
                  <input
                    type="number"
                    name="base_price"
                    value={formData.base_price || ''}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium backdrop-blur-sm"
                    placeholder="0.00 Credits"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                    Network Visibility *
                  </label>
                  <div className="relative">
                    <select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleInputChange}
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium backdrop-blur-sm"
                    >
                      <option value="public" className="bg-[#05070a]">Public - Open Network</option>
                      <option value="private" className="bg-[#05070a]">Private - Restricted Node</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {/* Vendor Selection for Private Listings */}
                {formData.visibility === 'private' && (
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                      Target Nodes *
                    </label>
                    {loadingVendors ? (
                      <div className="p-6 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">Synchronizing Contacts...</div>
                    ) : availableVendors.length === 0 ? (
                      <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-yellow-500">
                        <p className="text-[10px] font-black uppercase tracking-widest">No verified connections established. Secure connections are required for private nodes.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto border border-white/10 rounded-2xl p-4 bg-white/5 custom-scrollbar">
                        {availableVendors.map((connection) => (
                          <label key={connection.id} className="flex items-center p-4 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group">
                            <input
                              type="checkbox"
                              checked={formData.accessible_vendor_ids?.includes(connection.vendor.id) || false}
                              onChange={() => handleVendorSelection(connection.vendor.id)}
                              className="h-5 w-5 bg-white/5 border-white/10 rounded-lg text-indigo-500 focus:ring-offset-0 focus:ring-indigo-500/50"
                            />
                            <div className="ml-4">
                              <p className="text-white font-bold text-sm group-hover:text-indigo-400 transition-colors">
                                {connection.vendor.vendorProfile?.vendor_name || connection.vendor.name}
                              </p>
                              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                {connection.vendor.vendorProfile?.specialization || 'General Protocol'}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {formData.errors?.accessible_vendor_ids && (
                      <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{formData.errors.accessible_vendor_ids.join(', ')}</p>
                    )}
                  </div>
                )}

                <div className="md:col-span-2 pt-4">
                  <label className="flex items-center gap-4 cursor-pointer group w-fit">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="blockchain_enabled"
                        checked={formData.blockchain_enabled}
                        onChange={handleInputChange}
                        className="peer hidden"
                      />
                      <div className="w-12 h-6 bg-white/10 rounded-full border border-white/10 peer-checked:bg-indigo-500 transition-all" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform" />
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">
                      Activate Blockchain Immutability Protocol
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-10">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                  Protocol Specification *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className={`w-full px-6 py-5 bg-white/5 border rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium backdrop-blur-sm resize-none ${formData.errors?.description ? 'border-red-500/50' : 'border-white/10'
                    }`}
                  placeholder="Provide full technical parameters..."
                />
                {formData.errors?.description && (
                  <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{formData.errors.description.join(', ')}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Requirements Section */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-10 shadow-premium relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
              <div className="relative z-10">
                <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-12 px-2 border-l-2 border-indigo-500 ml-[-2px]">Prerequisites</h2>

                <div className="space-y-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                      className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium"
                      placeholder="Add Requirement"
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Inject
                    </button>
                  </div>

                  {formData.requirements && formData.requirements.length > 0 && (
                    <div className="space-y-2">
                      {formData.requirements.map((req, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl group/item">
                          <span className="text-gray-300 font-medium text-sm">{req}</span>
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-10 shadow-premium relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
              <div className="relative z-10">
                <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-12 px-2 border-l-2 border-indigo-500 ml-[-2px]">Data Parameters</h2>

                <div className="space-y-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={specificationInput}
                      onChange={(e) => setSpecificationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
                      className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium"
                      placeholder="Add Specification"
                    />
                    <button
                      type="button"
                      onClick={addSpecification}
                      className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Inject
                    </button>
                  </div>

                  {formData.specifications && formData.specifications.length > 0 && (
                    <div className="space-y-2">
                      {formData.specifications.map((spec, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl group/item">
                          <span className="text-gray-300 font-medium text-sm">{spec}</span>
                          <button
                            type="button"
                            onClick={() => removeSpecification(index)}
                            className="text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-10 shadow-premium relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-12 px-2 border-l-2 border-indigo-500 ml-[-2px]">Temporal Window</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                    Initialization State (Opens At)
                  </label>
                  <input
                    type="datetime-local"
                    name="opens_at"
                    value={formData.opens_at}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-5 bg-white/5 border rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium backdrop-blur-sm ${formData.errors?.opens_at ? 'border-red-500/50' : 'border-white/10'
                      }`}
                  />
                  {formData.errors?.opens_at && (
                    <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{formData.errors.opens_at.join(', ')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                    Termination State (Closes At)
                  </label>
                  <input
                    type="datetime-local"
                    name="closes_at"
                    value={formData.closes_at}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-5 bg-white/5 border rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium backdrop-blur-sm ${formData.errors?.closes_at ? 'border-red-500/50' : 'border-white/10'
                      }`}
                  />
                  {formData.errors?.closes_at && (
                    <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{formData.errors.closes_at.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-6 justify-end pt-8">
            <button
              type="button"
              onClick={() => navigate('/company/listings')}
              className="px-10 py-5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 rounded-2xl hover:bg-white/5 hover:text-white transition-all"
            >
              Abort Protocol
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] hover:shadow-glow-primary active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="relative z-10 flex items-center gap-3">
                {loading ? 'Initializing...' : 'Transmit Listing'}
                {!loading && <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
              </span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CompanyCreateListing;
