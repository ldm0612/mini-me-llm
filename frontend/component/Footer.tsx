import React from 'react';
import { FooterProps } from './types';
import { FiFileText, FiLinkedin } from 'react-icons/fi';

export default function Footer({ 
  resumeUrl = "https://ldm0612.github.io/", 
  linkedinUrl = "https://www.linkedin.com/in/daoming-liu/" 
}: FooterProps) {
  return (
    <footer className="bg-[rgb(var(--color-background))] border-t border-[rgb(var(--color-secondary))] px-6 py-4 font-serif">
      <div className="flex justify-center space-x-6">
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-primary))] transition-colors"
        >
          <FiFileText className="w-5 h-5" />
          <span className="text-sm font-medium">Portfolio</span>
        </a>
        
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-primary))] transition-colors"
        >
          <FiLinkedin className="w-5 h-5" />
          <span className="text-sm font-medium">LinkedIn</span>
        </a>
      </div>
    </footer>
  );
}
