import React from 'react';
import BasePage from '../components/BasePage';

const Privacy: React.FC = () => {
  return (
    <BasePage 
      title="Privacy Policy" 
      subtitle="Your privacy is important to us. Learn how we collect, use, and protect your information."
    >
      <div className="max-w-4xl mx-auto bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-8">
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-white mb-6">Information We Collect</h2>
          <p className="text-blue-200 mb-4">
            We collect information you provide directly to us, such as when you create an account, 
            participate in procurement activities, or contact us for support.
          </p>
          
          <h3 className="text-xl font-semibold text-white mb-4">Types of Information</h3>
          <ul className="text-blue-200 mb-6 space-y-2">
            <li>Account information (name, email, company details)</li>
            <li>Transaction data and bidding history</li>
            <li>Communication preferences</li>
            <li>Technical information (IP address, browser type)</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-6">How We Use Your Information</h2>
          <p className="text-blue-200 mb-4">
            We use the information we collect to provide, maintain, and improve our services, 
            process transactions, and communicate with you.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">Data Security</h2>
          <p className="text-blue-200 mb-4">
            We implement appropriate security measures to protect your personal information 
            using blockchain technology and industry-standard encryption methods.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
          <p className="text-blue-200">
            If you have any questions about this Privacy Policy, please contact us at 
            privacy@rapp-platform.com
          </p>
        </div>
      </div>
    </BasePage>
  );
};

export default Privacy;
