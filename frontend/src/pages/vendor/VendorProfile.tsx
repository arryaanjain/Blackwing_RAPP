import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

const VendorProfile: React.FC = () => {
  const { currentProfile } = useAuth();
  const vendorProfile = currentProfile?.type === 'vendor' ? currentProfile : null;
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: vendorProfile?.vendor_name || vendorProfile?.name || '',
    description: vendorProfile?.description || '',
    gstNumber: vendorProfile?.gst_number || '',
    email: '', // Email is in user object, not profile
    contactPhone: vendorProfile?.contact_phone || '',
    website: vendorProfile?.website || '',
    location: vendorProfile?.location || ''
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
      console.log('Updating vendor profile:', formData);
      showToast({
        title: "Vendor Identity Updated",
        description: "Your professional credentials have been synchronized.",
        status: "success"
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({
        title: "Sync Failure",
        description: "Could not update vendor metadata.",
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="relative overflow-hidden rounded-[32px] p-12 border border-white/10 bg-white/5 backdrop-blur-md shadow-premium">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase leading-tight">Vendor <span className="text-indigo-500">Terminal</span></h1>
          <p className="text-gray-400 text-lg font-medium max-w-2xl">
            Configure your service profile and verify your cryptographic service credentials across the protocol mesh.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 pb-10 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Professional Metadata</h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em]">Verified Protocol Node</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="group px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center shadow-premium"
              >
                {isEditing ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Dissolve Edit
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modify Identity
                  </>
                )}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Vendor Entity Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">GST Registration Vector</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                      placeholder="Enter 15-char ID"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Capability Matrix Summary</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm resize-none"
                    placeholder="Describe your professional service vectors..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Secure Uplink Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                      placeholder="node@network.com"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Professional Hotline</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                      placeholder="+X-XXX-XXX-XXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Service Portfolio URL</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://terminal.node.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Operational Base Node</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Network Region"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-10 gap-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Abort Changes
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-12 py-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-glow-indigo hover:scale-105 disabled:opacity-50 active:scale-95"
                  >
                    {isLoading ? 'Synchronizing Mesh...' : 'Update Protocol Identity'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-12 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="group">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 group-hover:text-indigo-400 transition-colors">Digital Identity</h3>
                    <p className="text-3xl font-black text-white uppercase tracking-tight leading-none">{vendorProfile?.vendor_name || vendorProfile?.name || 'NOT_FOUND'}</p>
                  </div>

                  <div className="group">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 group-hover:text-indigo-400 transition-colors">Protocol UUID</h3>
                    <p className="text-xl font-black text-white uppercase tracking-tighter opacity-60 font-mono italic">#{vendorProfile?.id || 'NO_UUID'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="group">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 group-hover:text-indigo-400 transition-colors">Tax Verification</h3>
                    <p className="text-xl font-black text-white uppercase tracking-[0.2em]">{vendorProfile?.gst_number || 'UNVERIFIED'}</p>
                  </div>

                  <div className="group">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 group-hover:text-indigo-400 transition-colors">Cryptographic Hash</h3>
                    <p className="text-emerald-500 font-mono text-xs break-all bg-white/5 py-4 px-8 rounded-2xl border border-white/10 select-all shadow-inner">
                      {vendorProfile?.blockchain_tx_hash || 'PENDING_ON_CHAIN_SYNC'}
                    </p>
                  </div>
                </div>

                <div className="group border-t border-white/5 pt-10">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 group-hover:text-indigo-400 transition-colors">Service Capability matrix</h3>
                  <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-5xl">{vendorProfile?.description || 'No capability data indexed.'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-white/5 pt-10">
                  <div className="group">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 group-hover:text-indigo-400 transition-colors">Operational Base</h3>
                    <p className="text-xl font-black text-white uppercase tracking-tight italic">{vendorProfile?.location || 'UNDEFINED_SECTOR'}</p>
                  </div>

                  <div className="group">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 group-hover:text-indigo-400 transition-colors">Protocol Gateway</h3>
                    <div className="text-xl font-black text-white uppercase">
                      {vendorProfile?.website ? (
                        <a
                          href={vendorProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 hover:text-indigo-400 underline decoration-indigo-500/30 underline-offset-8 transition-all"
                        >
                          {vendorProfile.website.replace('https://', '')}
                        </a>
                      ) : 'SIGNAL_NOT_DETECTED'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
            <h2 className="text-xl font-black text-white mb-10 uppercase tracking-tight relative z-10">Security Protocol Matrix</h2>
            <div className="space-y-5 relative z-10">
              <button className="w-full flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group/opt">
                <div className="flex items-center gap-6">
                  <div className="bg-indigo-500/10 p-4 rounded-xl text-indigo-400 shadow-glow-indigo/10 border border-indigo-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Rotate Protocol Key</span>
                </div>
                <svg className="h-4 w-4 text-gray-600 group-hover/opt:text-white group-hover/opt:translate-x-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>

              <button className="w-full flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group/opt">
                <div className="flex items-center gap-6">
                  <div className="bg-purple-500/10 p-4 rounded-xl text-purple-400 border border-purple-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Neural Shield Encryption</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-purple-500/70 tracking-widest mr-2 underline underline-offset-4 decoration-purple-500/30">ENABLED</span>
                  <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                </div>
              </button>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 backdrop-blur-md rounded-[32px] p-10 shadow-premium group">
            <h2 className="text-xl font-black text-red-500 mb-6 uppercase tracking-tight">System Purge</h2>
            <p className="text-gray-500 mb-10 font-medium leading-relaxed">Initiating a terminal purge will decouple your node from the protocol mesh, invalidating all reputation indices and active biddings.</p>
            <button className="w-full px-10 py-5 rounded-2xl bg-red-950/20 border border-red-900/50 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-900 hover:text-white transition-all shadow-glow-primary active:scale-95">
              Purge Vendor Node
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorProfile;
