import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentProfile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'bg-blue-700 text-white'
      : 'text-blue-300 hover:bg-blue-700/50 hover:text-white';
  };

  const navItems = userType === 'company'
    ? [
        { name: 'Dashboard', path: ROUTES.PROTECTED.COMPANY.DASHBOARD },
        { name: 'Listings', path: ROUTES.PROTECTED.COMPANY.LISTINGS },
        { name: 'Create Listing', path: ROUTES.PROTECTED.COMPANY.LISTINGS_CREATE },
        { name: 'Manage Vendors', path: ROUTES.PROTECTED.COMPANY.VENDORS },
        { name: 'Profile', path: ROUTES.PROTECTED.COMPANY.PROFILE },
      ]
    : [
        { name: 'Dashboard', path: ROUTES.PROTECTED.VENDOR.DASHBOARD },
        { name: 'Browse Listings', path: ROUTES.PROTECTED.VENDOR.LISTINGS },
        { name: 'My Quotes', path: ROUTES.PROTECTED.VENDOR.QUOTES },
        { name: 'Manage Companies', path: ROUTES.PROTECTED.VENDOR.COMPANIES },
        { name: 'Profile', path: ROUTES.PROTECTED.VENDOR.PROFILE },
      ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      {/* Top Navigation Bar */}
      <nav className="bg-blue-900/90 backdrop-blur-sm border-b border-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to={ROUTES.PUBLIC.HOME} className="text-white font-bold text-xl">
                  Reverse Auction
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="bg-blue-800 p-1 px-3 rounded-full text-blue-200 text-sm flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="mr-1 font-mono">{shareId || 'Profile'}</span>
                </div>

                <Link
                  to={userType === 'company' ? ROUTES.PROTECTED.COMPANY.PROFILE : ROUTES.PROTECTED.VENDOR.PROFILE}
                  className="ml-3 bg-blue-800 hover:bg-blue-700 text-white py-1 px-3 rounded-md transition duration-150 ease-in-out flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>

                <div className="ml-3 relative">
                  <button
                    onClick={handleLogout}
                    className="bg-blue-700 hover:bg-blue-800 text-white py-1 px-3 rounded-md transition duration-150 ease-in-out"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
            <div className="mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-blue-300 hover:text-white hover:bg-blue-700 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 sm:px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`${isActive(
                  item.path
                )} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-blue-700">
            <div className="flex items-center px-5">
              <div className="text-base font-medium leading-none text-white">
                {name}
              </div>
              <div className="ml-3 text-sm font-medium leading-none text-blue-300 font-mono">
                {shareId && `${shareId}`}
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link
                to={userType === 'company' ? ROUTES.PROTECTED.COMPANY.PROFILE : ROUTES.PROTECTED.VENDOR.PROFILE}
                className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-300 hover:bg-blue-700 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-300 hover:bg-blue-700 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar & Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-blue-800/70 backdrop-blur-sm border-r border-blue-700">
            <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="px-4 mb-6">
                <div className="text-lg font-semibold text-white">
                  {userType === 'company' ? 'Company Dashboard' : 'Vendor Dashboard'}
                </div>
                <div className="text-sm text-blue-300">
                  <div>{name}</div>
                  {shareId && <div className="mt-1 font-mono text-xs">{shareId}</div>}
                </div>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${isActive(
                      item.path
                    )} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
