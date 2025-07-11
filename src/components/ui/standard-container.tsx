import React from 'react';

interface StandardContainerProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'public' | 'admin';
}

export function StandardContainer({
  className = '',
  children,
  variant = 'default',
}: StandardContainerProps) {
  const baseClasses = 'w-full mx-auto';

  const variantClasses = {
    default: 'max-w-4xl p-6 bg-white rounded-lg shadow-md',
    public:
      'max-w-2xl p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50',
    admin: 'max-w-6xl p-8 bg-gray-900 rounded-lg border border-gray-700',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
