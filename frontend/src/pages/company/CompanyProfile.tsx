import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

const CompanyProfile: React.FC = () => {
  const { currentProfile, user } = useAuth();
  // const updateProfile = ... // TODO: Implement profile update functionality
  const companyProfile = currentProfile?.type === 'company' ? currentProfile : null;
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: companyProfile?.company_name || companyProfile?.name || '',
    description: companyProfile?.description || '',
    gstNumber: companyProfile?.gst_number || '',
    email: '', // Email is in user object, not profile
    contactPhone: companyProfile?.contact_phone || '',
    website: companyProfile?.website || '',
    location: companyProfile?.location || ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // TODO: Implement profile update functionality
      // const success = await updateCompanyInfo({
      console.log('Updating profile with:', {
        name: formData.name,
        description: formData.description,
        gstNumber: formData.gstNumber,
        email: formData.email,
        contactPhone: formData.contactPhone,
        website: formData.website,
        location: formData.location
      });
      
      // For now, just simulate success until we implement the actual update
      const success = true;
      
      if (success) {
        showToast({
          title: "Profile Updated",
          description: "Your company profile has been successfully updated.",
          status: "success"
        });
        setIsEditing(false);
      } else {
        showToast({
          title: "Update Failed",
          description: "There was a problem updating your profile.",
          status: "error"
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({
        title: "Error",
        description: "An unexpected error occurred.",
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50 shadow-lg shadow-blue-900/30">
          <h1 className="text-2xl font-bold text-white mb-2">Company Profile</h1>
          <p className="text-blue-200">
            Manage your company information and settings
          </p>
        </div>
        
        <div className="bg-blue-950/60 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6 shadow-xl shadow-blue-950/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Profile Information</h2>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md shadow-blue-900/50 flex items-center"
            >
              {isEditing ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </>
              )}
            </button>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-blue-300 mb-2">Company Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-blue-950/70 border border-blue-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-blue-300 mb-2">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-blue-950/70 border border-blue-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-blue-300 mb-2">GST Number</label>
                <input 
                  type="text" 
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  className="w-full bg-blue-950/70 border border-blue-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-blue-300 mb-2">Contact Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-blue-950/70 border border-blue-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-blue-300 mb-2">Contact Phone</label>
                <input 
                  type="tel" 
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full bg-blue-950/70 border border-blue-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-blue-300 mb-2">Website</label>
                <input 
                  type="url" 
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full bg-blue-950/70 border border-blue-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-blue-300 mb-2">Location</label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                  className="w-full bg-blue-950/70 border border-blue-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-2 rounded mr-3"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-green-700 hover:bg-green-600 text-white px-6 py-2 rounded flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-blue-400 text-sm font-medium mb-1">Company Name</h3>
                  <p className="text-white">{companyProfile?.name || 'Not provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-blue-400 text-sm font-medium mb-1">Company ID</h3>
                  <p className="text-white">{companyProfile?.id || 'Not available'}</p>
                </div>
                
                <div>
                  <h3 className="text-blue-400 text-sm font-medium mb-1">GST Number</h3>
                  <p className="text-white">{companyProfile?.gst_number || 'Not provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-blue-400 text-sm font-medium mb-1">Wallet Address</h3>
                  <p className="text-white font-mono text-sm break-all">
                    {companyProfile?.blockchain_tx_hash || 'Not connected'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-blue-400 text-sm font-medium mb-1">Description</h3>
                <p className="text-white">{companyProfile?.description || 'No description provided'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-blue-400 text-sm font-medium mb-1">Contact Email</h3>
                  <p className="text-white">{user?.email || 'Not provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-blue-400 text-sm font-medium mb-1">Contact Phone</h3>
                  <p className="text-white">{companyProfile?.contact_phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-blue-400 text-sm font-medium mb-1">Website</h3>
                  <p className="text-white">
                    {companyProfile?.website ? (
                      <a 
                        href={companyProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {companyProfile.website}
                      </a>
                    ) : 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-blue-400 text-sm font-medium mb-1">Location</h3>
                  <p className="text-white">{companyProfile?.location || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-blue-400 text-sm font-medium mb-1">Account Created</h3>
                <p className="text-white">
                  {companyProfile?.created_at
                    ? new Date(companyProfile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Not available'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-blue-950/60 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6 shadow-xl shadow-blue-950/20">
          <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
          <div className="space-y-4">
            <button 
              className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md shadow-blue-900/50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Change Password
            </button>
            
            <button 
              className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md shadow-blue-900/50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Two-Factor Authentication
            </button>
          </div>
        </div>
        
        <div className="bg-red-950/40 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 shadow-xl shadow-red-950/20">
          <h2 className="text-xl font-semibold text-white mb-4">Danger Zone</h2>
          <p className="text-red-300 mb-4">
            Actions here can't be undone. Please proceed with caution.
          </p>
          <button 
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md shadow-red-900/50 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyProfile;
