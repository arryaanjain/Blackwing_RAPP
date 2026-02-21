import React from 'react';

interface TileProps {
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  variant?: 'company' | 'vendor' | 'default';
}

const Tile: React.FC<TileProps> = ({ 
  title, 
  description, 
  onClick, 
  className = '',
  buttonText = title.includes('Login') ? 'Login' : 'Sign Up',
  icon,
  variant = 'default'
}) => {
  const gradientStyles = {
    company: 'from-blue-600 to-indigo-800 border-blue-500/40 hover:border-blue-400/70',
    vendor: 'from-indigo-600 to-purple-800 border-indigo-500/40 hover:border-indigo-400/70',
    default: 'from-blue-800 to-blue-950 border-blue-700/40 hover:border-blue-600/70'
  };

  const buttonStyles = {
    company: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    vendor: 'from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
    default: 'from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
  };

  return (
    <div
      className={`backdrop-blur-sm bg-gradient-to-br ${gradientStyles[variant]} rounded-xl shadow-xl 
      p-7 cursor-pointer hover:shadow-2xl transition-all duration-300 flex flex-col justify-between 
      border hover:border-opacity-100 transform hover:-translate-y-1 group ${className}`}
      onClick={onClick}
    >
      <div className="bg-white/10 w-14 h-14 rounded-xl mb-5 flex items-center justify-center 
      shadow-lg backdrop-blur-sm group-hover:bg-white/20 transition-colors">
        {icon || <span className="text-2xl font-bold text-white">{title.charAt(0)}</span>}
      </div>
      <h2 className="text-2xl font-bold mb-3 text-white tracking-tight">{title}</h2>
      <p className="text-blue-100/90 mb-6 leading-relaxed">{description}</p>
      <button 
        className={`mt-auto bg-gradient-to-r ${buttonStyles[variant]} text-white px-6 py-3 
        rounded-lg shadow-lg shadow-blue-900/30 flex items-center justify-center 
        transition-all duration-300 group-hover:shadow-blue-900/50`}
      >
        <span className="mr-2 font-medium">{buttonText}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Tile;
