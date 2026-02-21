import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 
    hover:bg-blue-800/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-12 h-12 rounded-xl 
      mb-4 flex items-center justify-center shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-blue-200">{description}</p>
    </div>
  );
};

export default FeatureCard;
