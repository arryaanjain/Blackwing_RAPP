import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hover = true }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    // Mouse position for subtle 3D tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { damping: 30, stiffness: 200 });
    const mouseYSpring = useSpring(y, { damping: 30, stiffness: 200 });

    // Reduced tilt to max 3deg as requested
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3deg", "3deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !hover) return;

        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            {...({
                onMouseMove: handleMouseMove,
                onMouseLeave: handleMouseLeave,
                className: `glass-premium rounded-[32px] p-8 relative group transition-all duration-300 ${className}`
            } as any)}
            style={{
                rotateX: hover ? rotateX : 0,
                rotateY: hover ? rotateY : 0,
                transformStyle: "preserve-3d",
            } as any}
        >
            {/* Inner highlight gradient overlay */}
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Reflection border */}
            <div className="absolute inset-0 rounded-[32px] border border-white/[0.02] pointer-events-none group-hover:border-white/10 transition-colors" />

            <div style={{ transform: "translateZ(10px)" }}>
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
