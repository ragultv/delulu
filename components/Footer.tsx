import React from 'react';

interface FooterProps {
  isMobile?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isMobile = false }) => {
  return (
    <footer className={`
      bg-gray-900/90 backdrop-blur-sm border-t border-yellow-400/10 shrink-0
      ${isMobile ? 'mobile-footer-fixed p-3' : 'p-3'}
    `}>
      <div className="text-center">
        <p className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-sm'}`}>
          Made with ❤️ by{' '}
          <span className="text-yellow-400 font-medium">Pinnacle</span>
        </p>
        {!isMobile && (
          <p className="text-xs text-gray-500 mt-1">
            Powered by Nano-Banana • Creating comics with AI magic
          </p>
        )}
      </div>
    </footer>
  );
};
