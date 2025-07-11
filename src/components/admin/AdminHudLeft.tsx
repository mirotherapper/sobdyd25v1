'use client';

import React, { ReactNode } from 'react';
import { AdminHUD } from './AdminHUD';

interface AdminHudLeftProps {
  /** Controls whether the panel is open or closed. */
  isOpen: boolean;
  /** Callback function to toggle the `isOpen` state. */
  onToggle: () => void;
  /** The vertical text label displayed on the tab. */
  label: string;
  /** The icon element to display on the tab. */
  icon: ReactNode;
  /** The content to be displayed inside the slide-out panel. */
  children: ReactNode;
  /** The type of animation for the icon on the tab. */
  iconAnimation?: 'pulse' | 'rotate' | 'none';
}

export function AdminHudLeft({
  isOpen,
  onToggle,
  label,
  icon,
  children,
  iconAnimation = 'pulse',
}: AdminHudLeftProps) {
  return (
    <AdminHUD
      isOpen={isOpen}
      onToggle={onToggle}
      side="left"
      label={label}
      icon={icon}
      iconAnimation={iconAnimation}
    >
      {children}
    </AdminHUD>
  );
}
