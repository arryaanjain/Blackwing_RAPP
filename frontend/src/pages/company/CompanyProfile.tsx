import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

const CompanyProfile: React.FC = () => {
  const { currentProfile, user } = useAuth();
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
      // Logic for updating profile
      console.log('Updating profile with:', formData);

      showToast({
        title: "Profile Updated",
        description: "Your enterprise profile has been successfully updated on-chain.",
        status: "success"
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({
        title: "Error",
        description: "Failed to synchronize profile changes.",
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative overflow-hidden rounded-[40px] p-12 mb-12 border border-white/5 glass-premium">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase leading-tight">Company <span className="text-indigo-500">Identity</span></h1>
          <p className="text-gray-400 text-lg font-medium max-w-2xl">
            Manage your enterprise credentials and blockchain-verified procurement profile.
          </p>
        </div>

        <div className="glass-premium rounded-[32px] p-10 border-white/5 shadow-2xl bg-[#05070a]/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Profile Configuration</h2>
              <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mt-1">Verified Protocol Member</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center"
            >
              {isEditing ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit profile
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Enterprise Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">GST / Tax Identification</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Company Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Primary Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Hotline</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Corporate Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Global HQ Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-8 gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Discard changes
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-10 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isLoading ? 'Synchronizing...' : 'Update identity'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="group">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">Enterprise Name</h3>
                  <p className="text-2xl font-black text-white uppercase tracking-tight">{companyProfile?.name || 'Not provided'}</p>
                </div>

                <div className="group">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">Protocol Identity</h3>
                  <p className="text-xl font-black text-white uppercase tracking-tighter opacity-60">{companyProfile?.id || 'Not available'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="group">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">GST Certification</h3>
                  <p className="text-lg font-black text-white uppercase tracking-widest">{companyProfile?.gst_number || 'Not provided'}</p>
                </div>

                <div className="group">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">Sovereign Wallet</h3>
                  <p className="text-white font-mono text-sm break-all bg-white/5 py-3 px-6 rounded-2xl border border-white/10 select-all">
                    {companyProfile?.blockchain_tx_hash || 'Not connected'}
                  </p>
                </div>
              </div>

              <div className="group">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 group-hover:text-indigo-400 transition-colors">Commercial Description</h3>
                <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-4xl">{companyProfile?.description || 'No description provided'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="group">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">Operational Headquarters</h3>
                  <p className="text-lg font-black text-white uppercase tracking-tight">{companyProfile?.location || 'Not provided'}</p>
                </div>

                <div className="group">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">Verified Website</h3>
                  <div className="text-lg font-black text-white uppercase">
                    {companyProfile?.website ? (
                      <a
                        href={companyProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:text-indigo-400 underline decoration-indigo-500/30 underline-offset-8"
                      >
                        {companyProfile.website.replace('https://', '')}
                      </a>
                    ) : 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <div className="glass-premium rounded-[32px] p-10 border-white/5 bg-[#05070a]/40">
            <h2 className="text-xl font-black text-white mb-8 uppercase tracking-tight">Access Control</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <span className="text-white font-black uppercase tracking-widest text-[10px]">Credential Rotation</span>
                </div>
                <svg className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>

              <button className="w-full flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-white font-black uppercase tracking-widest text-[10px]">Quantum Protection</span>
                </div>
                <span className="text-xs font-black uppercase text-purple-500/50 mr-4">Active</span>
              </button>
            </div>
          </div>

          <div className="glass-premium rounded-[32px] p-10 border-red-500/10 bg-red-950/5">
            <h2 className="text-xl font-black text-red-500 mb-6 uppercase tracking-tight">Hazard Protocols</h2>
            <p className="text-gray-500 mb-8 font-medium">Decommissioning your account will purge all protocol metadata and active reverse-auctions.</p>
            <button className="px-8 py-3 rounded-xl bg-red-950/20 border border-red-950 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-900 hover:text-white transition-all">
              Initiate protocol exit
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyProfile;
