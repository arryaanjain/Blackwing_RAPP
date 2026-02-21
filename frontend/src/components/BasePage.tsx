import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface BasePageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const BasePage: React.FC<BasePageProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-blue-950">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
              {subtitle && (
                <p className="text-xl text-blue-200 max-w-3xl mx-auto">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BasePage;
