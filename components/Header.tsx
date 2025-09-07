
import React from 'react';
import GithubLogo from './icons/GithubLogo';

export const Header: React.FC = () => {
  return (
    <header className="backdrop-blur-sm shadow-md sticky top-0 z-10  bg-gray-900/50 border-b border-yellow-400/10">
      <div className="px-5 px py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
      <img src="/logo.png" alt="Delulu Logo" className="w-48 h-38  " />
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
