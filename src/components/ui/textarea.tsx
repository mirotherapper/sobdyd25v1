import React from 'react';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`resize-vertical w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
      {...props}
    />
  );
}
