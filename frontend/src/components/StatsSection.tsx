import React, { useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import Container from './ui/Container';
import Section from './ui/Section';
import GlassCard from './ui/GlassCard';

interface StatProps {
  value: string;
  label: string;
  suffix?: string;
}

const Stat: React.FC<StatProps> = ({ value, label, suffix = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as any, { once: true, margin: "-100px" });

  // Numeric extraction for animation
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;

  const springValue = useSpring(0, {
    damping: 30,
    stiffness: 100,
    mass: 1,
  });

  const displayValue = useTransform(springValue, (current) => {
    if (numericValue % 1 === 0) return Math.floor(current).toString();
    return current.toFixed(1);
  });

  useEffect(() => {
    if (isInView) {
      springValue.set(numericValue);
    }
  }, [isInView, numericValue, springValue]);

  return (
    <GlassCard className="text-center group border-indigo-500/5 hover:border-indigo-500/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <motion.div
        ref={ref}
        {...({ className: "text-5xl md:text-6xl font-black tracking-tighter text-gradient-brand mb-3 relative z-10" } as any)}
      >
        <motion.span>{displayValue as any}</motion.span>
        {value.includes('%') ? '%' : value.includes('M') ? 'M' : suffix}
      </motion.div>

      <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] relative z-10">
        {label}
      </div>
    </GlassCard>
  );
};

const StatsSection: React.FC = () => {
  return (
    <Section className="relative py-32">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <Stat value="30%" label="Procurement Savings" />
          <Stat value="65%" label="Automation Gain" />
          <Stat value="100%" label="Immutable Audit" />
          <Stat value="4.2M" label="Nodes Secured" />
        </div>
      </Container>
    </Section>
  );
};

export default StatsSection;
