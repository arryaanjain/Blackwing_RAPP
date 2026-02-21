import React from 'react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  ctaText,
  onCtaClick
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/90"></div>
        <div className="absolute inset-0 bg-[url('/background-grid.svg')] opacity-20"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="md:max-w-2xl lg:max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            {title}
          </h1>
          <p className="mt-6 text-xl text-blue-200 max-w-3xl">
            {subtitle}
          </p>
          <div className="mt-10">
            <button
              onClick={onCtaClick}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 
              text-white font-medium text-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 
              transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900"
            >
              {ctaText}
            </button>
          </div>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/3 
        hidden lg:block">
          <div className="w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 
          rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-0 left-1/4 transform translate-y-1/2 
        hidden lg:block">
          <div className="w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 
          rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
