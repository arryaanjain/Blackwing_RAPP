import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../config/routes';
import Button from './ui/Button';
import Container from './ui/Container';

interface NavLink {
  name: string;
  href?: string;
  subLinks?: { name: string; href: string }[];
}

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToJoinPlatform = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('join-platform');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById('join-platform');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const navLinks: NavLink[] = [
    { name: 'Home', href: '/' },
    {
      name: 'Platform',
      subLinks: [
        { name: 'Features', href: ROUTES.PUBLIC.FEATURES },
        { name: 'Solutions', href: ROUTES.PUBLIC.SOLUTIONS },
        { name: 'Pricing', href: ROUTES.PUBLIC.PRICING },
        { name: 'Demo', href: ROUTES.PUBLIC.DEMO }
      ]
    },
    {
      name: 'Company',
      subLinks: [
        { name: 'About', href: ROUTES.PUBLIC.ABOUT },
        { name: 'Team', href: ROUTES.PUBLIC.TEAM },
        { name: 'Careers', href: ROUTES.PUBLIC.CAREERS },
        { name: 'News', href: ROUTES.PUBLIC.NEWS }
      ]
    },
    {
      name: 'Resources',
      subLinks: [
        { name: 'Documentation', href: ROUTES.PUBLIC.DOCS },
        { name: 'Knowledge Base', href: ROUTES.PUBLIC.KNOWLEDGE_BASE },
        { name: 'Blog', href: ROUTES.PUBLIC.BLOG },
        { name: 'Guides', href: ROUTES.PUBLIC.GUIDES }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-3 bg-[#05070a]/60 backdrop-blur-2xl border-b border-white/[0.03]' : 'py-6 bg-transparent'}`}>
      <Container>
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center group">
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              {...({ className: "w-9 h-9 bg-white text-black rounded-lg flex items-center justify-center mr-3 shadow-premium" } as any)}
            >
              <span className="font-black text-lg">R</span>
            </motion.div>
            <span className="text-white text-xl font-bold tracking-tighter uppercase transition-colors">Rapp</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => {
                  link.subLinks && setActiveDropdown(link.name);
                  setHoveredNavItem(link.name);
                }}
                onMouseLeave={() => {
                  setActiveDropdown(null);
                  setHoveredNavItem(null);
                }}
              >
                {link.href ? (
                  <Link to={link.href} className="px-4 py-2 text-[13px] font-semibold text-gray-400 hover:text-white transition-colors relative group">
                    {link.name}
                    {isActive(link.href) && (
                      <motion.div
                        layoutId="nav-underline"
                        {...({ className: "absolute bottom-0 left-4 right-4 h-px bg-white/40" } as any)}
                      />
                    )}
                    {hoveredNavItem === link.name && !isActive(link.href) && (
                      <motion.div
                        layoutId="nav-hover-bg"
                        {...({ className: "absolute inset-0 bg-white/[0.03] rounded-lg -z-10" } as any)}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                ) : (
                  <button className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all duration-300 flex items-center gap-1.5 relative ${activeDropdown === link.name ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                    {link.name}
                    {hoveredNavItem === link.name && (
                      <motion.div
                        layoutId="nav-hover-bg"
                        {...({ className: "absolute inset-0 bg-white/[0.03] rounded-lg -z-10" } as any)}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <motion.svg
                      animate={{ rotate: activeDropdown === link.name ? 180 : 0 }}
                      {...({ className: "h-3 w-3 opacity-30" } as any)}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                )}

                <AnimatePresence>
                  {link.subLinks && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      {...({ className: "absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[260px] glass-premium rounded-xl p-2 z-[60] shadow-2xl border border-white/10 backdrop-blur-3xl" } as any)}
                    >
                      {link.subLinks.map((subLink) => (
                        <Link
                          key={subLink.name}
                          to={subLink.href}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center px-4 py-3 text-[13px] text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all relative group"
                        >
                          <motion.div
                            initial={{ height: 0 }}
                            whileHover={{ height: 16 }}
                            {...({ className: "absolute left-0 w-0.5 bg-white/40 rounded-full" } as any)}
                          />
                          {subLink.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/login" className="text-[11px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-[0.15em] relative group">
              Log in
              <motion.span
                layoutId="login-underline"
                {...({ className: "absolute -bottom-1 left-0 w-0 h-px bg-white/20 transition-all group-hover:w-full" } as any)}
              />
            </Link>
            <Button onClick={scrollToJoinPlatform} variant="primary" size="sm" className="uppercase tracking-widest text-[9px] font-black py-2.5 px-6 rounded-lg bg-white text-black hover:bg-gray-100 shadow-none border-0">
              Get Started
            </Button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-400 hover:text-white transition-colors">
              {mobileMenuOpen ? <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
            </button>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            {...({ className: "md:hidden glass border-t border-white/5 overflow-hidden" } as any)}
          >
            <div className="p-6 space-y-6">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.href ? (
                    <Link to={link.href} className="text-xl font-bold text-white block" onClick={() => setMobileMenuOpen(false)}>{link.name}</Link>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">{link.name}</div>
                      {link.subLinks?.map((subLink) => (
                        <Link key={subLink.name} to={subLink.href} className="block text-gray-400 text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>{subLink.name}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <Link to="/login" className="flex items-center justify-center py-4 text-white font-bold uppercase text-xs tracking-widest bg-white/5 rounded-2xl" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                <Button onClick={() => { scrollToJoinPlatform(); setMobileMenuOpen(false); }} className="w-full uppercase text-xs tracking-widest font-black py-4">Get Started</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
