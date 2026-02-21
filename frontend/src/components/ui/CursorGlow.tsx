import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CursorGlow: React.FC = () => {
    const mouseX = useMotionValue(-500);
    const mouseY = useMotionValue(-500);

    // Smooth follow lag as requested
    const springConfig = { damping: 40, stiffness: 200 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Disabled on mobile (check width)
            if (window.innerWidth < 768) {
                setIsVisible(false);
                return;
            }

            // Only show glow in hero and navbar area (approx top 900px)
            if (e.pageY < 900) {
                mouseX.set(e.clientX - 150);
                mouseY.set(e.clientY - 150);
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            {...({ className: "fixed top-0 left-0 w-[300px] h-[300px] pointer-events-none z-[1]" } as any)}
            style={{
                x: cursorX,
                y: cursorY,
                opacity: isVisible ? 0.12 : 0,
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, rgba(34, 211, 238, 0.3) 50%, transparent 100%)',
                filter: 'blur(100px)',
                mixBlendMode: 'screen',
            } as any}
            transition={{ opacity: { duration: 0.8 } }}
        />
    );
};

export default CursorGlow;
