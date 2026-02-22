import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';


interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentProfile, user } = useAuth();
  const walletBalance = user?.wallet_balance ?? 0;
  /* Removed unused mobile menu state as it's not being used in this desktop-focused layout */

  // Custom logout handler that redirects to home
  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.PUBLIC.HOME);
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout fails
      navigate(ROUTES.PUBLIC.HOME);
    }
  };

  // Derive data from current profile
  const userType = currentProfile?.type || 'company';
  const name = currentProfile?.name || currentProfile?.company_name || currentProfile?.vendor_name || 'User';
  const shareId = currentProfile?.share_id || null;

  /* Removed unused isActive */

  const navItems = userType === 'company'
    ? [
      { name: 'Dashboard', path: ROUTES.PROTECTED.COMPANY.DASHBOARD },
      { name: 'Listings', path: ROUTES.PROTECTED.COMPANY.LISTINGS },
      { name: 'Create Listing', path: ROUTES.PROTECTED.COMPANY.LISTINGS_CREATE },
      { name: 'Manage Vendors', path: ROUTES.PROTECTED.COMPANY.VENDORS },
      { name: 'Profile', path: ROUTES.PROTECTED.COMPANY.PROFILE },
      { name: 'Wallet', path: ROUTES.PROTECTED.WALLET },
    ]
    : [
      { name: 'Dashboard', path: ROUTES.PROTECTED.VENDOR.DASHBOARD },
      { name: 'Browse Listings', path: ROUTES.PROTECTED.VENDOR.LISTINGS },
      { name: 'My Quotes', path: ROUTES.PROTECTED.VENDOR.QUOTES },
      { name: 'Auctions', path: ROUTES.PROTECTED.VENDOR.AUCTIONS },
      { name: 'Manage Companies', path: ROUTES.PROTECTED.VENDOR.COMPANIES },
      { name: 'Profile', path: ROUTES.PROTECTED.VENDOR.PROFILE },
      { name: 'Wallet', path: ROUTES.PROTECTED.WALLET },
    ];

  return (
    <div className="min-h-screen flex flex-col bg-[#05070a] relative overflow-hidden text-white">
      {/* Immersive Background System */}
      <div className="bg-mesh" />
      <div className="noise-overlay" />

      {/* Top Navigation Bar */}
      <nav className="relative z-50 bg-[#05070a]/40 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to={ROUTES.PUBLIC.HOME} className="text-white font-black text-2xl uppercase tracking-tighter flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center group-hover:rotate-12 transition-transform shadow-premium">
                    <span className="font-black text-lg">R</span>
                  </div>
                  <span className="text-white">RAPP</span>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 gap-6">
                <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                  {shareId || 'PRO'}
                </div>

                <Link
                  to={ROUTES.PROTECTED.WALLET}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 flex items-center gap-1.5 transition-all shadow-glass"
                  title="Wallet"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.09 12.97 12 12l-1 8 8.91-10.97H12l1-8z" /></svg>
                  {walletBalance} pts
                </Link>

                <div className="h-8 w-px bg-white/5 mx-2"></div>

                <div className="flex items-center gap-4">
                  <Link
                    to={userType === 'company' ? ROUTES.PROTECTED.COMPANY.PROFILE : ROUTES.PROTECTED.VENDOR.PROFILE}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all hover:scale-[1.02]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar & Content */}
      <div className="flex flex-1 relative z-10 overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-72 bg-[#05070a]/20 backdrop-blur-3xl border-r border-white/5">
            <div className="h-0 flex-1 flex flex-col pt-10 pb-4 overflow-y-auto">
              <div className="px-8 mb-12">
                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">
                  {userType === 'company' ? 'Company Console' : 'Vendor Terminal'}
                </div>
                <div className="text-3xl font-black text-white uppercase tracking-tighter truncate leading-tight">
                  {name}
                </div>
              </div>
              <nav className="mt-5 flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`${active
                        ? 'bg-white/5 text-white border-white/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                        : 'text-gray-500 hover:bg-white/[0.03] hover:text-gray-300 border-transparent'
                        } group flex items-center px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border transition-all duration-300 relative overflow-hidden`}
                    >
                      {active && (
                        <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full" />
                      )}
                      <span className="ml-2">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="py-12 px-6 sm:px-10 lg:px-12 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
