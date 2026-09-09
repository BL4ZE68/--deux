'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-pink-600 text-white hover:bg-pink-700 active:bg-pink-800',
      secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700',
      ghost: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-800 transition-shadow ${className}`}
      {...props}
    />
  )
);

Card.displayName = 'Card';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => {
  const variants = {
    default: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200',
    success: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variants[variant as keyof typeof variants] || variants.default}`}>
      {children}
    </span>
  );
};

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse ${className}`} />
);
