import React, { useEffect, useRef, useState } from 'react';

const CursorGlow: React.FC = () => {
    const glowRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: -500, y: -500 });
    const currentPos = useRef({ x: -500, y: -500 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Disabled on mobile
            if (window.innerWidth < 768) {
                setIsVisible(false);
                return;
            }

            // Only show glow in hero area
            if (e.pageY < 1000) {
                mousePos.current = { x: e.clientX, y: e.clientY };
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        let animationFrameId: number;

        const animate = () => {
            // LERP formula: current = current + (target - current) * ease
            // 0.08 offers a very smooth, atmospheric lag
            currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.08;
            currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.08;

            if (glowRef.current) {
                // Offset by half width/height (175px) to center on cursor
                glowRef.current.style.transform = `translate3d(${currentPos.current.x - 175}px, ${currentPos.current.y - 175}px, 0)`;
                glowRef.current.style.opacity = isVisible ? '0.6' : '0';
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isVisible]);

    return (
        <div
            ref={glowRef}
            className="fixed top-0 left-0 w-[350px] h-[350px] pointer-events-none z-[1] will-change-transform transition-opacity duration-700"
            style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(168, 85, 247, 0.25) 35%, transparent 70%)',
                filter: 'blur(80px)',
                mixBlendMode: 'screen',
                opacity: 0,
            }}
        />
    );
};

export default CursorGlow;
