import React from 'react';
import Container from './ui/Container';
import Section from './ui/Section';
import Button from './ui/Button';

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
    <Section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <Container className="relative z-10">
        <div className="glass p-12 md:p-20 rounded-[40px] border-indigo-500/20 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-gradient max-w-4xl mx-auto leading-tight">
            {title}
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button
              onClick={onPrimaryClick}
              variant="primary"
              size="lg"
              glow
              className="px-12 py-5 text-lg uppercase tracking-wider"
            >
              {primaryButtonText}
            </Button>

            {secondaryButtonText && onSecondaryClick && (
              <Button
                onClick={onSecondaryClick}
                variant="glass"
                size="lg"
                className="px-12 py-5 text-lg uppercase tracking-wider border-white/10"
              >
                {secondaryButtonText}
              </Button>
            )}
          </div>

          <div className="mt-16 pt-16 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Uptime', val: '99.99%' },
              { label: 'Security', val: 'SOC2 L2' },
              { label: 'Latency', val: '< 50ms' },
              { label: 'Support', val: '24/7/365' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-white font-bold text-xl mb-1 uppercase tracking-tighter">{stat.val}</div>
                <div className="text-gray-500 text-xs uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default CallToAction;
