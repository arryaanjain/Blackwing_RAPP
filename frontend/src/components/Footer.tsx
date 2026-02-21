import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { name: 'Features', href: '/features' },
        { name: 'Solutions', href: '/solutions' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Demo', href: '/demo' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Team', href: '/team' },
        { name: 'Careers', href: '/careers' },
        { name: 'News', href: '/news' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Knowledge Base', href: '/knowledge-base' },
        { name: 'Blog', href: '/blog' },
        { name: 'Guides', href: '/guides' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Security', href: '/security' },
        { name: 'Compliance', href: '/compliance' }
      ]
    }
  ];

  // Social media links for future use
  // const socialLinks = [
  //   { name: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
  //   { name: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
  //   { name: 'GitHub', href: 'https://github.com', icon: 'github' }
  // ];

  return (
    <footer className="bg-blue-950 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2">
            <div className="text-2xl font-bold mb-4">RAPP</div>
            <p className="text-blue-300 mb-6 max-w-md">
              Revolutionizing procurement with blockchain technology for enhanced 
              transparency, efficiency, and trust.
            </p>
            <div className="flex space-x-4">
              {/* {socialLinks.map((social) => (
                <a 
                  key={social.name} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-white transition-colors"
                >
                  <span className="sr-only">{social.name}</span>
                  <div className="h-6 w-6 bg-blue-300/20 rounded flex items-center justify-center hover:bg-blue-300/40 transition-all">
                    {social.icon}
                  </div>
                </a>
              ))} */}
            </div>
          </div>
          
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-blue-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 mt-8 border-t border-blue-900 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-400">
            &copy; {currentYear} RAPP Technologies. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/privacy" className="text-blue-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-blue-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/cookies" className="text-blue-400 hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
