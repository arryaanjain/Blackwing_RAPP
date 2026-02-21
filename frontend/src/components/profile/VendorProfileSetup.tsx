import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';

interface VendorProfileSetupProps {}

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Checking your vendor profile...</p>
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
          message: isEditing ? 'Profile updated successfully! Please login again.' : 'Vendor profile created successfully! Please login again to access your dashboard.',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isEditing ? 'Complete Your Vendor Profile' : 'Create Vendor Profile'}
            </h2>
            <p className="text-blue-200">
              {isEditing ? 'Fill in the missing details to access your dashboard' : 'Set up your vendor profile to get started'}
            </p>
          </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Vendor Name */}
            <div>
              <label htmlFor="vendor_name" className="block text-sm font-medium text-blue-200 mb-2">
                Vendor/Business Name *
              </label>
              <input
                id="vendor_name"
                name="vendor_name"
                type="text"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your vendor name"
                value={formData.vendor_name}
                onChange={handleInputChange}
              />
            </div>

            {/* Specialization */}
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-blue-200 mb-2">
                Specialization *
              </label>
              <select
                id="specialization"
                name="specialization"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                value={formData.specialization}
                onChange={handleInputChange}
              >
                <option value="" className="bg-slate-800 text-white">Select specialization</option>
                <option value="raw_materials" className="bg-slate-800 text-white">Raw Materials</option>
                <option value="industrial_supplies" className="bg-slate-800 text-white">Industrial Supplies</option>
                <option value="office_supplies" className="bg-slate-800 text-white">Office Supplies</option>
                <option value="machinery" className="bg-slate-800 text-white">Machinery & Equipment</option>
                <option value="chemicals" className="bg-slate-800 text-white">Chemicals</option>
                <option value="textiles" className="bg-slate-800 text-white">Textiles</option>
                <option value="electronics" className="bg-slate-800 text-white">Electronics</option>
                <option value="automotive_parts" className="bg-slate-800 text-white">Automotive Parts</option>
                <option value="packaging" className="bg-slate-800 text-white">Packaging Materials</option>
                <option value="construction_materials" className="bg-slate-800 text-white">Construction Materials</option>
                <option value="food_beverage" className="bg-slate-800 text-white">Food & Beverage</option>
                <option value="medical_supplies" className="bg-slate-800 text-white">Medical Supplies</option>
                <option value="printing_supplies" className="bg-slate-800 text-white">Printing Supplies</option>
                <option value="agricultural_supplies" className="bg-slate-800 text-white">Agricultural Supplies</option>
                <option value="software_services" className="bg-slate-800 text-white">Software & IT Services</option>
                <option value="consulting" className="bg-slate-800 text-white">Consulting Services</option>
                <option value="logistics" className="bg-slate-800 text-white">Logistics & Transportation</option>
                <option value="maintenance_services" className="bg-slate-800 text-white">Maintenance Services</option>
                <option value="other" className="bg-slate-800 text-white">Other</option>
              </select>
            </div>

            {/* GST Number */}
            <div>
              <label htmlFor="gst_number" className="block text-sm font-medium text-blue-200 mb-2">
                GST Number
              </label>
              <input
                id="gst_number"
                name="gst_number"
                type="text"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="Enter GST number (optional)"
                value={formData.gst_number}
                onChange={handleInputChange}
              />
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
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="https://www.example.com"
                value={formData.website}
                onChange={handleInputChange}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-blue-200 mb-2">
                Business Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 resize-none"
                placeholder="Brief description of your business and services"
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
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
    </div>
  );
};

export default VendorProfileSetup;