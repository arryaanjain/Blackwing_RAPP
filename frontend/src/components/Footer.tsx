import React from 'react';
import { Link } from 'react-router-dom';
import Container from './ui/Container';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Protocol',
      links: [
        { name: 'Features', href: '/features' },
        { name: 'Solutions', href: '/solutions' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Demo', href: '/demo' }
      ]
    },
    {
      title: 'Ecosystem',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Team', href: '/team' },
        { name: 'Careers', href: '/careers' },
        { name: 'News', href: '/news' }
      ]
    },
    {
      title: 'Infrastructure',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Knowledge Base', href: '/knowledge-base' },
        { name: 'Developer API', href: '/api' },
        { name: 'Status', href: '/status' }
      ]
    },
    {
      title: 'Legal & Trust',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Security', href: '/security' },
        { name: 'Compliance', href: '/compliance' }
      ]
    }
  ];

  return (
    <footer className="relative pt-24 pb-12 overflow-hidden border-t border-white/5">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 mb-20">
          <div className="col-span-2">
            <Link to="/" className="flex items-center group mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-white text-2xl font-bold tracking-tight uppercase">Rapp</span>
            </Link>
            <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
              The leading institutional protocol for decentralized procurement. Secure, transparent, and high-performance trade execution.
            </p>
            <div className="flex gap-4">
              {[
                'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z',
                'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
                'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
              ].map((icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-indigo-500 hover:text-white transition-all transform hover:-translate-y-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((column) => (
            <div key={column.title} className="space-y-6">
              <h3 className="text-white text-sm font-bold uppercase tracking-[0.2em]">
                {column.title}
              </h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-500 hover:text-white transition-colors text-sm font-medium"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-gray-600 text-xs font-medium uppercase tracking-widest">
            &copy; {currentYear} Rapp Technologies. Global Sourcing. Decentralized Trust.
          </div>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Mainnet Live</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Built with precision</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
