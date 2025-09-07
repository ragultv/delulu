
import React from 'react';

export const Header: React.FC = () => {
  return (
   <header className=" backdrop-blur-sm shadow-md sticky top-0 z-10">
      <div className="px-6 py-3 flex items-center justify-center">
        <div className="flex items-center gap-3">

          <h1 className="text-xl md:text-2xl font-bold">
            Delulu - AI Powered Comic Generator
          </h1>
        </div>
      </div>
    </header>
  );
};
