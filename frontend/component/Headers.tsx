import React from 'react';
import { HeaderProps } from './types';
import { FiMenu } from 'react-icons/fi';

export default function Header({ title = "DM Bot", onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-[rgb(var(--color-primary))] border-b border-[rgb(var(--color-border))] shadow-md px-6 py-4">
      <div className="flex items-center">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="mr-4 p-2 text-[rgb(var(--color-surface))] hover:bg-[rgba(var(--color-accent),0.3)] rounded-lg transition-colors"
            title="Show Sidebar"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[rgb(var(--color-accent))] rounded-lg flex items-center justify-center shadow">
            <span className="text-[rgb(var(--color-surface))] font-bold text-sm">DM</span>
          </div>
          <span className="text-xl font-semibold text-[rgb(var(--color-surface))]">{title}</span>
        </div>
      </div>
    </header>
  );
}
