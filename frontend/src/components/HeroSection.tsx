import React from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import Container from './ui/Container';
import Section from './ui/Section';
import HeroParticles from './ui/HeroParticles';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  subtitle,
  ctaText,
  onCtaClick
}) => {
  return (
    <Section className="relative pt-32 pb-20 md:pt-48 md:pb-48 overflow-hidden">

      {/* Particle Background */}
      <HeroParticles />

      <Container className="text-center relative z-10">

        {/* Main Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          {...({ className: "" } as any)}
        >

          {/* Protocol Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Mainnet Protocol v4.0
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-shimmer">
            <>
              REVOLUTIONIZE <br />
              MATERIAL <br />
              <span className="text-gradient-brand">
                PROCUREMENT
              </span>
            </>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-12 leading-relaxed font-medium">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              onClick={onCtaClick}
              variant="primary"
              size="lg"
              className="px-12 py-5 text-xs font-black uppercase tracking-widest min-w-[200px]"
            >
              {ctaText}
            </Button>

            <button className="text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest px-8 py-5 border border-white/5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05]">
              View Documentation
            </button>
          </div>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          {...({ className: "mt-24 relative max-w-6xl mx-auto" } as any)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent z-10" />

          <div className="glass-premium rounded-[32px] p-1.5 md:p-3 overflow-hidden shadow-2xl">
            <div className="rounded-[22px] overflow-hidden bg-black/60 aspect-video relative group">

              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <img
                src="https://images.unsplash.com/photo-1551288049-bbda38a5f452?auto=format&fit=crop&q=80&w=2000"
                alt="Dashboard Mockup"
                className="w-full h-full object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-1000"
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

            </div>
          </div>

        </motion.div>

      </Container>
    </Section>
  );
};

export default HeroSection;