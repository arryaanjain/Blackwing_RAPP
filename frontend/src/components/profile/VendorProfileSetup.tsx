import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';
import BasePage from '../BasePage';

interface VendorProfileSetupProps { }

const VendorProfileSetup: React.FC<VendorProfileSetupProps> = () => {
  const navigate = useNavigate();
  const { createVendorProfile, updateProfile, currentProfile, checkVendorProfile, switchToProfileType } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Initialize formData state early to avoid hooks order issues
  const [formData, setFormData] = useState({
    vendor_name: '',
    specialization: '',
    gst_number: '',
    location: '',
    description: '',
    contact_phone: '',
    website: ''
  });

  // Update formData when currentProfile is available
  useEffect(() => {
    if (currentProfile?.type === 'vendor') {
      setFormData({
        vendor_name: currentProfile.vendor_name || '',
        specialization: currentProfile.specialization || '',
        gst_number: currentProfile.gst_number || '',
        location: currentProfile.location || '',
        description: currentProfile.description || '',
        contact_phone: currentProfile.contact_phone || '',
        website: currentProfile.website || ''
      });
    }
  }, [currentProfile]);

  // Check if user already has a vendor profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const result = await checkVendorProfile();
        if (result.has_vendor_profile && result.vendor_profile) {
          // User already has a vendor profile, switch to it and redirect to dashboard
          await switchToProfileType('vendor');
          navigate(ROUTES.PROTECTED.VENDOR.DASHBOARD, { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error checking existing vendor profile:', error);
        // If check fails, continue to show the form
      } finally {
        setCheckingProfile(false);
      }
    };

    checkExistingProfile();
  }, [checkVendorProfile, switchToProfileType, navigate]);

  // Show loading while checking for existing profile
  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a] relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-mesh opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070a] via-[#05070a]/90 to-[#05070a]"></div>
        </div>
        <div className="glass-premium rounded-[32px] p-12 border-white/10 relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-6"></div>
          <p className="text-emerald-500 font-bold uppercase tracking-widest text-[10px]">Syncing Vendor Metadata...</p>
        </div>
      </div>
    );
  }

  const isEditing = currentProfile?.type === 'vendor' && !currentProfile.is_complete;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && currentProfile) {
        // Update existing profile
        await updateProfile(currentProfile.id, 'vendor', formData);
      } else {
        // Create new profile
        await createVendorProfile(formData);
      }

      // Navigate to home page with success message AND logout instruction
      navigate('/', {
        replace: true,
        state: {
          message: isEditing ? 'Profile updated successfully!' : 'Vendor profile created successfully! Initializing your terminal...',
          type: 'success',
          shouldLogout: true  // Flag to trigger logout on landing page
        }
      });
    } catch (error: any) {
      console.error('Error saving vendor profile:', error);
      setError(error.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasePage
      title={<>Service <span className="text-emerald-500">Onboarding</span></>}
      subtitle={isEditing ? 'Synchronize your professional metadata with the protocol.' : 'Register your service node as a verified protocol vendor.'}
    >
      <div className="max-w-xl mx-auto">
        <div className="glass-premium rounded-[40px] p-10 border-white/5 shadow-2xl bg-[#05070a]/40">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20 group hover:rotate-12 transition-transform duration-500 text-black">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Vendor Name */}
              <div className="space-y-2 text-left">
                <label htmlFor="vendor_name" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Vendor / Business Identity
                </label>
                <input
                  id="vendor_name"
                  name="vendor_name"
                  type="text"
                  required
                  className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                  placeholder="Ex. Cyberdyne Systems"
                  value={formData.vendor_name}
                  onChange={handleInputChange}
                />
              </div>

              {/* Specialization */}
              <div className="space-y-2 text-left">
                <label htmlFor="specialization" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Capability Matrix
                </label>
                <select
                  id="specialization"
                  name="specialization"
                  required
                  className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                  value={formData.specialization}
                  onChange={handleInputChange}
                >
                  <option value="" className="bg-[#05070a] text-white">Select Mastery</option>
                  <option value="raw_materials" className="bg-[#05070a] text-white">Raw Materials</option>
                  <option value="industrial_supplies" className="bg-[#05070a] text-white">Industrial Supplies</option>
                  <option value="office_supplies" className="bg-[#05070a] text-white">Office Supplies</option>
                  <option value="machinery" className="bg-[#05070a] text-white">Machinery & Equipment</option>
                  <option value="chemicals" className="bg-[#05070a] text-white">Chemicals</option>
                  <option value="textiles" className="bg-[#05070a] text-white">Textiles</option>
                  <option value="electronics" className="bg-[#05070a] text-white">Electronics</option>
                  <option value="automotive_parts" className="bg-[#05070a] text-white">Automotive Parts</option>
                  <option value="packaging" className="bg-[#05070a] text-white">Packaging Materials</option>
                  <option value="construction_materials" className="bg-[#05070a] text-white">Construction Materials</option>
                  <option value="food_beverage" className="bg-[#05070a] text-white">Food & Beverage</option>
                  <option value="medical_supplies" className="bg-[#05070a] text-white">Medical Supplies</option>
                  <option value="printing_supplies" className="bg-[#05070a] text-white">Printing Supplies</option>
                  <option value="agricultural_supplies" className="bg-[#05070a] text-white">Agricultural Supplies</option>
                  <option value="software_services" className="bg-[#05070a] text-white">Software & IT Services</option>
                  <option value="consulting" className="bg-[#05070a] text-white">Consulting Services</option>
                  <option value="logistics" className="bg-[#05070a] text-white">Logistics & Transportation</option>
                  <option value="maintenance_services" className="bg-[#05070a] text-white">Maintenance Services</option>
                  <option value="other" className="bg-[#05070a] text-white">Other</option>
                </select>
              </div>

              {/* GST Number */}
              <div className="space-y-2 text-left">
                <label htmlFor="gst_number" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  GST / Tax Identity (Optional)
                </label>
                <input
                  id="gst_number"
                  name="gst_number"
                  type="text"
                  className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                  placeholder="15-character ID"
                  value={formData.gst_number}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <label htmlFor="location" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Base Location</label>
                  <input
                    id="location" name="location" type="text" required
                    className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                    placeholder="Ex. London, UK" value={formData.location} onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label htmlFor="contact_phone" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure Hotline</label>
                  <input
                    id="contact_phone" name="contact_phone" type="tel" required
                    className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                    placeholder="+44..." value={formData.contact_phone} onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label htmlFor="website" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Professional Portfolio
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2 text-left">
                <label htmlFor="description" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Service Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium resize-none"
                  placeholder="Summarize your professional capabilities..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5">
                <div className="text-[10px] font-black uppercase text-red-500 tracking-widest">{error}</div>
              </div>
            )}

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-2xl shadow-emerald-600/20"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                    Synchronizing...
                  </div>
                ) : (
                  isEditing ? 'Update Identity' : 'Register Service Node'
                )}
              </button>
            </div>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => navigate(ROUTES.AUTH.CALLBACK)}
                className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                ← System Menu
              </button>
            </div>
          </form>
        </div>
      </div>
    </BasePage>
  );
};

export default VendorProfileSetup;
