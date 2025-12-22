import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-400 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95";

  const variants = {
    primary: "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:bg-white/20 border-white/20",
    secondary: "bg-purple-500/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30 hover:border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    danger: "bg-rose-500/20 text-rose-200 border-rose-500/30 hover:bg-rose-500/30 hover:border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    success: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30 hover:bg-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    outline: "border-2 border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
  };

  const sizes = {
    sm: "h-9 px-4 text-xs tracking-wider uppercase",
    md: "h-11 px-6 py-2.5 text-sm tracking-wide",
    lg: "h-14 px-10 text-base tracking-wide",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};