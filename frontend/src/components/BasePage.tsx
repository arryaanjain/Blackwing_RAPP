import React from 'react';
import { motion } from 'framer-motion';
import CursorGlow from './ui/CursorGlow';
import HeroParticles from './ui/HeroParticles';
import Section from './ui/Section';
import Container from './ui/Container';

interface BasePageProps {
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}

const BasePage: React.FC<BasePageProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#020617]">
      {/* Immersive Background System */}
      <div className="bg-mesh" />
      <div className="noise-overlay" />
      <CursorGlow />
      <HeroParticles />

      <main className="relative z-10">
        <Section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <Container className="text-center">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-shimmer uppercase">
                {title}
              </h1>
              {subtitle && (
                <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-12 leading-relaxed font-medium">
                  {subtitle}
                </p>
              )}
            </motion.div>
          </Container>
        </Section>

        {/* Content Section */}
        <Section className="pb-32">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </Container>
        </Section>
      </main>
    </div>
  );
};

export default BasePage;
