import React from 'react';

interface StepProps {
  number: number;
  title: string;
  description: string;
  isLast?: boolean;
}

const Step: React.FC<StepProps> = ({ number, title, description, isLast = false }) => {
  return (
    <div className="flex">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg">
          {number}
        </div>
        {!isLast && (
          <div className="h-full w-0.5 bg-blue-700 my-2"></div>
        )}
      </div>
      <div className="ml-6 pb-8">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-blue-200">{description}</p>
      </div>
    </div>
  );
};

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up as a company or vendor and complete your profile with relevant business information.'
    },
    {
      number: 2,
      title: 'Connect Your Business',
      description: 'Integrate your procurement processes or register as a vendor to participate in bidding opportunities.'
    },
    {
      number: 3,
      title: 'Issue or Bid on RFPs',
      description: 'Companies can create detailed RFPs while vendors can browse and bid on relevant opportunities.'
    },
    {
      number: 4,
      title: 'Smart Contract Execution',
      description: 'When a bid is accepted, a blockchain-verified smart contract is automatically generated and executed.'
    },
    {
      number: 5,
      title: 'Track & Monitor Performance',
      description: 'Monitor contract performance, make payments, and build your reputation on the platform.'
    }
  ];

  return (
    <div className="bg-blue-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">How It Works</h2>
          <p className="mt-4 text-xl text-blue-200">Simple steps to transform your procurement process</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-0">
            {steps.map((step, index) => (
              <Step
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>
          
          <div className="relative rounded-xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm"></div>
            <div className="relative p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Blockchain-Powered Trust</h3>
              <p className="text-blue-200 mb-6">
                Every transaction on RAPP is secured and verified using blockchain technology, creating 
                an immutable record that ensures transparency and prevents fraud.
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-900/50 border border-blue-700/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white">Secure & Tamper-proof</h4>
                      <p className="text-blue-200">All transactions are cryptographically secured</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900/50 border border-blue-700/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white">Auditable History</h4>
                      <p className="text-blue-200">Complete record of all procurement activities</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900/50 border border-blue-700/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white">Dispute Resolution</h4>
                      <p className="text-blue-200">Evidence-based resolution with verifiable data</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;
