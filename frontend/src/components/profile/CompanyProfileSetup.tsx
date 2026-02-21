import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';
import authService from '../../services/authService';
import BasePage from '../BasePage';

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
          message: isEditing ? 'Profile updated successfully!' : 'Company profile created successfully! Initializing your console...',
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
    <BasePage
      title={<>Company <span className="text-indigo-500">Genesis</span></>}
      subtitle={isEditing ? 'Finalize your protocol identity to access the reverse-auction terminal.' : 'Initialize your corporate node on the RAPP network.'}
    >
      <div className="max-w-xl mx-auto">
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-10 shadow-premium relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20 group hover:rotate-12 transition-transform duration-500 text-black">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>

            <form className="space-y-12" onSubmit={handleSubmit}>
              <div>
                <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-12 px-2 border-l-2 border-indigo-500 ml-[-2px]">Identity Parameters</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label htmlFor="company_name" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                      Entity Designation
                    </label>
                    <input
                      id="company_name"
                      name="company_name"
                      type="text"
                      required
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                      placeholder="Ex. Sirius Cybernetics"
                      value={formData.company_name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="business_type" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                      Sector Classification
                    </label>
                    <div className="relative">
                      <select
                        id="business_type"
                        name="business_type"
                        required
                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                        value={formData.business_type}
                        onChange={handleInputChange}
                      >
                        <option value="" className="bg-[#05070a]">Select classification...</option>
                        <option value="manufacturing" className="bg-[#05070a]">Manufacturing</option>
                        <option value="trading" className="bg-[#05070a]">Trading</option>
                        <option value="service" className="bg-[#05070a]">Service</option>
                        <option value="retail" className="bg-[#05070a]">Retail</option>
                        <option value="wholesale" className="bg-[#05070a]">Wholesale</option>
                        <option value="construction" className="bg-[#05070a]">Construction</option>
                        <option value="technology" className="bg-[#05070a]">Technology</option>
                        <option value="healthcare" className="bg-[#05070a]">Healthcare</option>
                        <option value="education" className="bg-[#05070a]">Education</option>
                        <option value="other" className="bg-[#05070a]">Other</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-12 px-2 border-l-2 border-indigo-500 ml-[-2px]">Network Vector</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label htmlFor="gst_number" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                      GST / Tax Identity
                    </label>
                    <div className="relative">
                      <input
                        id="gst_number"
                        name="gst_number"
                        type="text"
                        required
                        maxLength={15}
                        className={`w-full px-6 py-5 bg-white/5 border rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm ${gstVerifying ? 'border-yellow-500/50' :
                          gstVerified ? 'border-green-500/50' :
                            gstError ? 'border-red-500/50' :
                              'border-white/10'
                          }`}
                        placeholder="15-character ID"
                        value={formData.gst_number}
                        onChange={handleInputChange}
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        {gstVerifying && <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>}
                        {!gstVerifying && gstVerified && <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                        {!gstVerifying && gstError && <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>}
                      </div>
                    </div>

                    {gstVerified && gstData && (
                      <div className="mt-4 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-green-500 mb-2">Verified Identity</p>
                        <p className="text-white font-bold text-sm">{gstData.legal_name || gstData.trade_name}</p>
                      </div>
                    )}
                    {gstError && (
                      <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{gstError}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Base Location</label>
                    <input
                      id="location" name="location" type="text" required
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                      placeholder="Ex. Mumbai" value={formData.location} onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact_phone" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Secure Hotline</label>
                    <input
                      id="contact_phone" name="contact_phone" type="tel" required
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                      placeholder="+91..." value={formData.contact_phone} onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-12 px-2 border-l-2 border-indigo-500 ml-[-2px]">Commercial Profile</h2>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                    Commercial Profile
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm resize-none"
                    placeholder="Company mission statement..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>
                </div>
              )}

              <div className="pt-10 flex flex-col gap-6">
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] hover:shadow-glow-primary active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? 'Synchronizing Archive...' : isEditing ? 'Update Identity Protocol' : 'Initialize Protocol Node'}
                    {!loading && <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                  ← Previous State
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default CompanyProfileSetup;
