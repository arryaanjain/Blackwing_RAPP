import React from 'react';
import { Link } from 'react-router-dom';
import Container from './ui/Container';
import { ROUTES } from '../config/routes';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05070a] border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-indigo-500/0 via-indigo-500/20 to-indigo-500/0"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-purple-500/0 via-purple-500/20 to-purple-500/0"></div>
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-6">
              <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center mr-3 font-black">R</div>
              <span className="text-white text-lg font-bold tracking-tighter uppercase">Rapp</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              The next-generation protocol for decentralized, high-performance procurement.
              Bridging the gap between buyers and providers with ZK-security and immutable trust.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Discord', 'Github'].map((social) => (
                <a key={social} href="#" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/20 transition-all">
                  <span className="sr-only">{social}</span>
                  <div className="w-4 h-4 rounded-full bg-current opacity-20"></div>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-12">
            {/* Navigation */}
            <div>
              <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-8">Navigation</h3>
              <ul className="space-y-4">
                <li><Link to={ROUTES.PUBLIC.FEATURES} className="text-gray-500 hover:text-white transition-colors text-[13px] font-medium">Features</Link></li>
                <li><Link to={ROUTES.PUBLIC.SOLUTIONS} className="text-gray-500 hover:text-white transition-colors text-[13px] font-medium">Solutions</Link></li>
                <li><Link to={ROUTES.PUBLIC.PRICING} className="text-gray-500 hover:text-white transition-colors text-[13px] font-medium">Pricing</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-8">Resources</h3>
              <ul className="space-y-4">
                <li><Link to={ROUTES.PUBLIC.DOCS} className="text-gray-500 hover:text-white transition-colors text-[13px] font-medium">Documentation</Link></li>
                <li><Link to={ROUTES.PUBLIC.GUIDES} className="text-gray-500 hover:text-white transition-colors text-[13px] font-medium">Guides</Link></li>
                <li><Link to={ROUTES.PUBLIC.KNOWLEDGE_BASE} className="text-gray-500 hover:text-white transition-colors text-[13px] font-medium">Knowledge Base</Link></li>
              </ul>
            </div>

            {/* Infrastructure */}
            <div>
              <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-8">Infrastructure</h3>
              <ul className="space-y-4">
                <li><Link to={ROUTES.PUBLIC.BLOG} className="text-gray-500 hover:text-white transition-colors text-[13px] font-medium">Blog</Link></li>
                <li><Link to={ROUTES.PUBLIC.GUIDES} className="text-gray-500 hover:text-white transition-colors text-[13px] font-medium">Guides</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8">
            <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">© 2025 RAPP Protocol</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Testnet Live</span>
            </div>
          </div>
          <div className="flex gap-8">
            <Link to={ROUTES.PUBLIC.PRIVACY} className="text-gray-600 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">Privacy</Link>
            <Link to={ROUTES.PUBLIC.TERMS} className="text-gray-600 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">Terms</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
