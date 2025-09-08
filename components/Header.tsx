import React, { useState, useEffect } from 'react';
import GithubLogo from './icons/GithubLogo';

export const Header: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if the device is mobile based on screen width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  return (
    <header className="backdrop-blur-sm shadow-md sticky top-0 z-10 bg-gray-900/50 border-b border-yellow-400/10">
      <div className="px-3 md:px-5 py-2 md:py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Delulu Logo" 
            className={isMobile ? "w-32 h-10" : "w-48 h-38"} 
          />
        </div>
        <a
          href="https://github.com/ragultv/delulu.git"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 md:ml-4 hover:opacity-80"
          aria-label="View on GitHub"
        >
          <GithubLogo size={isMobile ? 24 : 28} />
        </a>
      </div>
    </header>
  );
};
