
import React from 'react';
import GithubLogo from './icons/GithubLogo';

export const Header: React.FC = () => {
  return (
    <header className="backdrop-blur-sm shadow-md sticky top-0 z-10">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold">
            Delulu - AI Powered Comic Generator
          </h1>
        </div>
        <a
          href="https://github.com/ragultv/delulu.git"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 hover:opacity-80"
          aria-label="View on GitHub"
        >
          <GithubLogo size={28} />
        </a>
      </div>
    </header>
  );
};
