import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    vx: number;
    vy: number;
    size: number;
}

const HeroParticles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const mouse = useRef({ x: -1000, y: -1000 });
    const animationFrameId = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = 800; // Hero height approx
            initParticles();
        };

        const initParticles = () => {
            particles.current = [];
            const spacing = 40;

            for (let x = 0; x < canvas.width; x += spacing) {
                for (let y = 0; y < canvas.height; y += spacing) {
                    particles.current.push({
                        x,
                        y,
                        originX: x,
                        originY: y,
                        vx: 0,
                        vy: 0,
                        size: Math.random() * 0.6 + 0.8
                    });
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.current.forEach(p => {
                const dx = mouse.current.x - p.x;
                const dy = mouse.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const force = dist < 120 ? (120 - dist) / 120 : 0;

                // Repulsion physics
                if (force > 0) {
                    const angle = Math.atan2(dy, dx);
                    p.vx -= Math.cos(angle) * force * 1.5;
                    p.vy -= Math.sin(angle) * force * 1.5;
                }

                // Return to origin (spring physics)
                p.vx += (p.originX - p.x) * 0.05;
                p.vy += (p.originY - p.y) * 0.05;

                // Friction
                p.vx *= 0.9;
                p.vy *= 0.9;

                p.x += p.vx;
                p.y += p.vy;

                // Draw with enhanced visibility and subtle glow
                ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + force * 0.15})`;
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Reset shadow to avoid affecting other draws if any
                ctx.shadowBlur = 0;
            });

            animationFrameId.current = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current.x = e.clientX - rect.left;
            mouse.current.y = e.clientY - rect.top;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{ opacity: 0.3 }}
        />
    );
};

export default HeroParticles;
