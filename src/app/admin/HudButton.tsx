"use client";

import React, { ReactNode, useRef } from 'react';
import { gsap } from 'gsap';

type ButtonVariant = 'cyan' | 'magenta' | 'yellow';

interface HudButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

const variantStyles = {
  cyan: {
    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 100, 255, 0.1))',
    borderColor: 'rgba(0, 255, 255, 0.3)',
    hoverBorderColor: 'rgba(0, 255, 255, 0.6)',
    hoverBoxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
  },
  magenta: {
    background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(255, 0, 100, 0.1))',
    borderColor: 'rgba(255, 0, 255, 0.3)',
    hoverBorderColor: 'rgba(255, 0, 255, 0.6)',
    hoverBoxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
  },
  yellow: {
    background: 'linear-gradient(135deg, rgba(255, 255, 0, 0.1), rgba(255, 150, 0, 0.1))',
    borderColor: 'rgba(255, 255, 0, 0.3)',
    hoverBorderColor: 'rgba(255, 255, 0, 0.6)',
    hoverBoxShadow: '0 0 20px rgba(255, 255, 0, 0.3)',
  },
};

export function HudButton({ children, icon, variant = 'cyan', className, ...props }: HudButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const styles = variantStyles[variant];

  // GSAP-based hover animations
  const handleMouseEnter = () => gsap.to(buttonRef.current, { borderColor: styles.hoverBorderColor, boxShadow: styles.hoverBoxShadow, duration: 0.3 });
  const handleMouseLeave = () => gsap.to(buttonRef.current, { borderColor: styles.borderColor, boxShadow: 'none', duration: 0.3 });

  return (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`w-full p-4 rounded-lg border transition-transform duration-200 ease-in-out hover:scale-[0.98] active:scale-[0.96] relative overflow-hidden text-white font-semibold ${className || ''}`}
      style={{
        background: styles.background,
        borderColor: styles.borderColor,
      }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">
        {icon && <span className="mr-3">{icon}</span>}
        {children}
      </span>
    </button>
  );
}