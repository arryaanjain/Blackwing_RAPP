import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavLink {
  name: string;
  href?: string;
  subLinks?: { name: string; href: string }[];
}

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Function to scroll to join platform section
  const scrollToJoinPlatform = () => {
    // If we're not on the home page, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById('join-platform');
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      // If we're already on home page, just scroll
      const element = document.getElementById('join-platform');
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  const navLinks: NavLink[] = [
    { name: 'Home', href: '/' },
    {
      name: 'Platform',
      subLinks: [
        { name: 'Features', href: '/features' },
        { name: 'Solutions', href: '/solutions' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Demo', href: '/demo' }
      ]
    },
    {
      name: 'Company',
      subLinks: [
        { name: 'About', href: '/about' },
        { name: 'Team', href: '/team' },
        { name: 'Careers', href: '/careers' },
        { name: 'News', href: '/news' }
      ]
    },
    {
      name: 'Resources',
      subLinks: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Knowledge Base', href: '/knowledge-base' },
        { name: 'Blog', href: '/blog' },
        { name: 'Guides', href: '/guides' }
      ]
    },
    {
      name: 'Legal',
      subLinks: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Security', href: '/security' },
        { name: 'Compliance', href: '/compliance' }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-blue-900/90 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-white text-xl font-bold">RAPP</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.subLinks && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.href ? (
                  <Link
                    to={link.href}
                    className={`text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? 'text-white'
                        : 'text-blue-200 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    className="text-sm font-medium text-blue-200 hover:text-white transition-colors flex items-center"
                  >
                    {link.name}
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                
                {/* Dropdown Menu */}
                {link.subLinks && activeDropdown === link.name && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-blue-900/95 backdrop-blur-md rounded-md shadow-lg py-2 z-50 border border-blue-700/50">
                    {link.subLinks.map((subLink) => (
                      <Link
                        key={subLink.name}
                        to={subLink.href}
                        className="block px-4 py-2 text-sm text-blue-200 hover:bg-blue-800/50 hover:text-white transition-colors"
                      >
                        {subLink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={scrollToJoinPlatform}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 
              text-white font-medium shadow-sm hover:from-blue-600 hover:to-indigo-700 
              transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none 
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900"
            >
              Get Started
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 
              hover:text-white hover:bg-blue-800 focus:outline-none focus:ring-2 
              focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">
                {mobileMenuOpen ? 'Close menu' : 'Open menu'}
              </span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-900/95 backdrop-blur-md border-t border-blue-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.href ? (
                  <Link
                    to={link.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(link.href)
                        ? 'text-white bg-blue-800'
                        : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <>
                    <div className="block px-3 py-2 text-base font-medium text-blue-200">
                      {link.name}
                    </div>
                    {link.subLinks && (
                      <div className="ml-4 space-y-1">
                        {link.subLinks.map((subLink) => (
                          <Link
                            key={subLink.name}
                            to={subLink.href}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-blue-300 hover:bg-blue-800 hover:text-white"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subLink.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="pt-4 pb-2 border-t border-blue-800">
              <button
                onClick={() => {
                  scrollToJoinPlatform();
                  setMobileMenuOpen(false);
                }}
                className="block w-full px-3 py-2 rounded-md text-base font-medium text-white 
                bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
