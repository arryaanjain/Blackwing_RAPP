import React from 'react';

interface CallToActionProps {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  onPrimaryClick: () => void;
  onSecondaryClick?: () => void;
}

const CallToAction: React.FC<CallToActionProps> = ({
  title,
  subtitle,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl">
          <div className="absolute inset-0 bg-[url('/background-grid.svg')] opacity-10"></div>
          
          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4">
            <div className="w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4">
            <div className="w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative px-6 py-12 md:py-16 md:px-12 text-center">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">{subtitle}</p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={onPrimaryClick}
                className="px-8 py-3 rounded-lg bg-white text-blue-700 font-medium 
                shadow-lg hover:bg-blue-50 transition-all duration-300 transform 
                hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white 
                focus:ring-offset-2 focus:ring-offset-blue-700"
              >
                {primaryButtonText}
              </button>
              
              {secondaryButtonText && onSecondaryClick && (
                <button
                  onClick={onSecondaryClick}
                  className="px-8 py-3 rounded-lg bg-transparent border-2 border-white 
                  text-white font-medium hover:bg-white/10 transition-all duration-300 
                  transform hover:-translate-y-1 focus:outline-none focus:ring-2 
                  focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
                >
                  {secondaryButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
