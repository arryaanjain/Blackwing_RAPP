import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'glass' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', glow = false, className = '', ...props }) => {
    const [ripples, setRipples] = useState<{ x: number, y: number, id: number }[]>([]);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples(prev => [...prev, { x, y, id }]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);
    };

    const baseStyles = 'relative inline-flex items-center justify-center font-black transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl overflow-hidden';

    const variants = {
        primary: 'bg-white text-black hover:bg-gray-100',
        secondary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-glow-indigo',
        glass: 'glass-premium text-white hover:bg-white/10 backdrop-blur-md',
        outline: 'border border-white/10 text-white hover:bg-white/5'
    };

    const sizes = {
        sm: 'px-6 py-2.5 text-[10px] tracking-widest',
        md: 'px-8 py-3.5 text-xs tracking-[0.2em]',
        lg: 'px-12 py-5 text-sm tracking-[0.3em]'
    };

    return (
        <motion.button
            onMouseDown={handleMouseDown}
            whileHover={{ y: -1, scale: 1.01 }}
            {...({ className: `${baseStyles} ${variants[variant]} ${sizes[size]} group ${className}` } as any)}
            {...(props as any)}
        >
            {/* Ripple Layer */}
            {ripples.map(ripple => (
                <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.3 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    {...({ className: "absolute rounded-full bg-black/10 pointer-events-none" } as any)}
                    style={{
                        left: ripple.x - 10,
                        top: ripple.y - 10,
                        width: 20,
                        height: 20,
                    }}
                />
            ))}

            {/* Subtle Glow Pulse for primary/secondary */}
            {glow && (
                <div className="absolute inset-0 -z-10 bg-white/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}

            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </motion.button>
    );
};

export default Button;
