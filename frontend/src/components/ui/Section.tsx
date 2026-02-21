import React from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
    variant?: 'default' | 'dark' | 'subtle';
}

const Section: React.FC<SectionProps> = ({ children, className = '', id, variant = 'default' }) => {
    const variants = {
        default: '',
        dark: 'bg-black/20',
        subtle: 'bg-white/[0.01]'
    };

    return (
        <motion.section
            {...(id ? { id } : {})}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            {...({ className: `relative py-24 md:py-32 flex flex-col items-center justify-center min-h-[100px] w-full ${variants[variant]} ${className}` } as any)}
        >
            {children}
        </motion.section>
    );
};

export default Section;
