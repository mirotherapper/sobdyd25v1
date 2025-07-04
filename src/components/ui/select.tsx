import React from 'react';

interface SelectProps {
  className?: string;
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectItemProps {
  className?: string;
  children: React.ReactNode;
  value: string;
}

export function Select({ className = '', children, value, onValueChange }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
}

export function SelectTrigger({ className = '', children }: SelectTriggerProps) {
  return (
    <button
      type="button"
      className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: SelectValueProps) {
  return (
    <span className="text-gray-500">
      {placeholder}
    </span>
  );
}

export function SelectContent({ className = '', children }: SelectContentProps) {
  return (
    <div className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function SelectItem({ className = '', children, value }: SelectItemProps) {
  return (
    <div
      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${className}`}
      data-value={value}
    >
      {children}
    </div>
  );
}
