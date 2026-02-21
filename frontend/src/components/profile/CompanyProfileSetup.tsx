import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';
import authService from '../../services/authService';

interface CompanyProfileSetupProps { }

const CompanyProfileSetup: React.FC<CompanyProfileSetupProps> = () => {
  const navigate = useNavigate();
  const { createCompanyProfile, updateProfile, currentProfile, checkCompanyProfile, switchToProfileType } = useAuth();

  // All useState hooks must be declared first, before any conditional logic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [formData, setFormData] = useState({
    company_name: '',
    business_type: '',
    gst_number: '',
    location: '',
    description: '',
    contact_phone: '',
    website: ''
  });
  const [gstError, setGstError] = useState<string | null>(null);
  const [gstVerifying, setGstVerifying] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [gstData, setGstData] = useState<any>(null);

  // Initialize form data when currentProfile changes
  React.useEffect(() => {
    if (currentProfile?.type === 'company') {
      setFormData({
        company_name: currentProfile.company_name || '',
        business_type: currentProfile.business_type || '',
        gst_number: currentProfile.gst_number || '',
        location: currentProfile.location || '',
        description: currentProfile.description || '',
        contact_phone: currentProfile.contact_phone || '',
        website: currentProfile.website || ''
      });
    }
  }, [currentProfile]);

  // Check if user already has a company profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const result = await checkCompanyProfile();
        if (result.has_company_profile && result.company_profile) {
          // User already has a company profile, switch to it and redirect to dashboard
          await switchToProfileType('company');
          navigate(ROUTES.PROTECTED.COMPANY.DASHBOARD, { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error checking existing company profile:', error);
        // If check fails, continue to show the form
      } finally {
        setCheckingProfile(false);
      }
    };

    checkExistingProfile();
  }, [checkCompanyProfile, switchToProfileType, navigate]);

  // Derived state - must be after all hooks
  const isEditing = currentProfile?.type === 'company' && !currentProfile.is_complete;
  const isSubmitDisabled = loading || gstVerifying || !!gstError || !formData.gst_number || !gstVerified;

  const isValidGSTIN = (gstin: string) => {
    const value = gstin.trim().toUpperCase();
    // Basic format validation: 15 characters matching GST pattern
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const isValid = regex.test(value);
    console.log('🔍 GST Format Validation:', { gstin: value, isValid, length: value.length });
    return isValid;
  };

  // Show loading while checking for existing profile
  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Checking your profile...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gst_number' ? value.toUpperCase() : value
    }));
    if (name === 'gst_number') {
      const v = value.toUpperCase();
      console.log('📝 GST Input Changed:', v);
      setGstVerified(false);
      setGstData(null);

      if (!v) {
        setGstError('GSTIN is required');
      } else if (!isValidGSTIN(v)) {
        console.log('❌ GST Format validation failed');
        setGstError('Invalid GSTIN format');
      } else {
        console.log('✅ GST Format valid, starting API verification...');
        setGstError(null);
        // Trigger real-time verification after format validation passes
        verifyGstNumber(v);
      }
    }
  };

  // Real-time GST verification function
  const verifyGstNumber = async (gstNumber: string) => {
    if (gstNumber.length !== 15) return;

    setGstVerifying(true);
    setGstError(null);

    try {
      const response = await authService.verifyGst(gstNumber);

      if (response.data.valid) {
        setGstVerified(true);
        setGstData(response.data.data);
        setGstError(null);
        console.log('✅ GST verified:', response.data.data);
      } else {
        setGstVerified(false);
        setGstData(null);
        setGstError(response.data.message || 'GST verification failed');
        console.error('❌ GST verification failed:', response.data.message);
      }
    } catch (error: any) {
      console.error('❌ GST verification error:', error);
      setGstVerified(false);
      setGstData(null);
      setGstError(error.response?.data?.message || 'Failed to verify GST number');
    } finally {
      setGstVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const v = formData.gst_number?.trim().toUpperCase();
      if (!v || !isValidGSTIN(v)) {
        setGstError('Invalid GSTIN');
        setLoading(false);
        return;
      }
      if (isEditing && currentProfile) {
        // Update existing profile
        await updateProfile(currentProfile.id, 'company', formData);
      } else {
        // Create new profile
        await createCompanyProfile(formData);
      }

      // Navigate to home page with success message AND logout instruction
      navigate('/', {
        replace: true,
        state: {
          message: isEditing ? 'Profile updated successfully! Please login again.' : 'Company profile created successfully! Please login again to access your dashboard.',
          type: 'success',
          shouldLogout: true  // Flag to trigger logout on landing page
        }
      });
    } catch (error: any) {
      console.error('Error saving company profile:', error);
      setError(error.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isEditing ? 'Complete Your Company Profile' : 'Create Company Profile'}
            </h2>
            <p className="text-blue-200">
              {isEditing ? 'Fill in the missing details to access your dashboard' : 'Set up your company profile to get started'}
            </p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-blue-200 mb-2">
                Company Name *
              </label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your company name"
                value={formData.company_name}
                onChange={handleInputChange}
              />
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="business_type" className="block text-sm font-medium text-blue-200 mb-2">
                Business Type *
              </label>
              <select
                id="business_type"
                name="business_type"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                value={formData.business_type}
                onChange={handleInputChange}
              >
                <option value="" className="bg-slate-800 text-white">Select business type</option>
                <option value="manufacturing" className="bg-slate-800 text-white">Manufacturing</option>
                <option value="trading" className="bg-slate-800 text-white">Trading</option>
                <option value="service" className="bg-slate-800 text-white">Service</option>
                <option value="retail" className="bg-slate-800 text-white">Retail</option>
                <option value="wholesale" className="bg-slate-800 text-white">Wholesale</option>
                <option value="construction" className="bg-slate-800 text-white">Construction</option>
                <option value="technology" className="bg-slate-800 text-white">Technology</option>
                <option value="healthcare" className="bg-slate-800 text-white">Healthcare</option>
                <option value="education" className="bg-slate-800 text-white">Education</option>
                <option value="other" className="bg-slate-800 text-white">Other</option>
              </select>
            </div>

            {/* GST Number */}
            <div>
              <label htmlFor="gst_number" className="block text-sm font-medium text-blue-200 mb-2">
                GST Number *
              </label>
              <div className="relative">
                <input
                  id="gst_number"
                  name="gst_number"
                  type="text"
                  required
                  maxLength={15}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${gstVerifying ? 'border-yellow-400 focus:ring-yellow-400' :
                      gstVerified ? 'border-green-400 focus:ring-green-400' :
                        gstError ? 'border-red-400 focus:ring-red-400' :
                          'border-white/20 focus:ring-blue-400'
                    }`}
                  placeholder="Enter 15-character GSTIN"
                  value={formData.gst_number}
                  onChange={handleInputChange}
                />
                {/* Verification Status Icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {gstVerifying && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
                  )}
                  {!gstVerifying && gstVerified && (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                  {!gstVerifying && gstError && formData.gst_number.length === 15 && (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  )}
                </div>
              </div>

              {/* GST Verification Messages */}
              {gstVerifying && (
                <p className="mt-2 text-sm text-yellow-400 flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying GST number...
                </p>
              )}
              {!gstVerifying && gstVerified && gstData && (
                <div className="mt-2 p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
                  <p className="text-sm text-green-400 font-medium flex items-center mb-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    GST Number Verified
                  </p>
                  {gstData.legal_name && (
                    <p className="text-xs text-green-300">Legal Name: {gstData.legal_name}</p>
                  )}
                  {gstData.trade_name && (
                    <p className="text-xs text-green-300">Trade Name: {gstData.trade_name}</p>
                  )}
                  {gstData.status && (
                    <p className="text-xs text-green-300">Status: {gstData.status}</p>
                  )}
                </div>
              )}
              {!gstVerifying && gstError && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {gstError}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-blue-200 mb-2">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="City, State"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-blue-200 mb-2">
                Contact Phone *
              </label>
              <input
                id="contact_phone"
                name="contact_phone"
                type="tel"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="Enter contact phone number"
                value={formData.contact_phone}
                onChange={handleInputChange}
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-blue-200 mb-2">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="https://www.example.com"
                value={formData.website}
                onChange={handleInputChange}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-blue-200 mb-2">
                Company Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 resize-none"
                placeholder="Brief description of your company"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 backdrop-blur-sm">
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating Profile...' : 'Creating Profile...'}
                </div>
              ) : (
                isEditing ? 'Complete Profile & Continue' : 'Create Profile & Continue'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate(ROUTES.AUTH.CALLBACK)}
              className="text-sm text-blue-300 hover:text-blue-200 transition-colors duration-200"
            >
              Back to profile selection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfileSetup;