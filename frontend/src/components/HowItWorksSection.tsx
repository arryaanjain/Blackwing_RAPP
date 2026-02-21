import React from 'react';
import Container from './ui/Container';
import Section from './ui/Section';
import GlassCard from './ui/GlassCard';

interface StepProps {
  number: string;
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({ number, title, description }) => (
  <div className="relative group">
    <div className="flex items-center gap-6 mb-6">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg">
        {number}
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Join the network as a company or vendor. Our automated onboarding validates your business credentials instantly.'
    },
    {
      number: '02',
      title: 'Business Connect',
      description: 'Integrate your existing procurement systems with our blockchain bridge for seamless data flow.'
    },
    {
      number: '03',
      title: 'Issue & Bid',
      description: 'Create high-fidelity RFPs or place bids. Every interaction is cryptographically signed and stored.'
    },
    {
      number: '04',
      title: 'Smart Execution',
      description: 'Agreements transition into smart contracts, automating escrow, delivery tracking, and payments.'
    }
  ];

  return (
    <Section id="how-it-works">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-indigo-400 font-semibold uppercase tracking-widest text-sm mb-4 text-left">The Protocol</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-8 text-gradient text-left">How Rapp powers your trust</h3>
            <p className="text-gray-400 text-lg mb-12 text-left leading-relaxed">
              We've distilled complex blockchain logic into a simple, high-performance workflow. From identity verification to automated settlement.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
              {steps.map((step, index) => (
                <Step key={index} {...step} />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600/10 blur-[100px] rounded-full" />
            <GlassCard className="relative p-2 md:p-10 border-indigo-500/10" hover={false}>
              <div className="space-y-6">
                {[
                  { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Secure & Tamper-proof', desc: 'SHA-256 cryptographic hashing' },
                  { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', title: 'Auditable History', desc: 'Full event sourcing architecture' },
                  { icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Decentralized Identity', desc: 'W3C compliant DID resolution' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-tight">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default HowItWorksSection;
