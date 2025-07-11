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

export function Select({ className = '', children }: SelectProps) {
  return <div className={`relative ${className}`}>{children}</div>;
}

export function SelectTrigger({
  className = '',
  children,
}: SelectTriggerProps) {
  return (
    <button
      type="button"
      className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: SelectValueProps) {
  return <span className="text-gray-500">{placeholder}</span>;
}

export function SelectContent({
  className = '',
  children,
}: SelectContentProps) {
  return (
    <div
      className={`absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

export function SelectItem({
  className = '',
  children,
  value,
}: SelectItemProps) {
  return (
    <div
      className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${className}`}
      data-value={value}
    >
      {children}
    </div>
  );
}
