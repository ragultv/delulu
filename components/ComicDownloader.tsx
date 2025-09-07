import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ComicPdfDownloader } from './PdfDownloader';
import { ImageDownloader } from './ImageDownloader';

interface PdfDownloaderProps {
  comicPanels: Array<{
    image?: string;
    text?: string;
    id: number;
  }>;
  title?: string;
}

export const ComicDownloader: React.FC<PdfDownloaderProps> = ({ comicPanels, title = 'My Comic' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Show sidebar with download options
  const handleDownloadClick = () => {
    setIsSidebarOpen(true);
  };
  
  // Close sidebar
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  return (
    <>
      <button
        onClick={handleDownloadClick}
        className={`flex items-center gap-2 px-4 py-2 ${isGenerating ? 'bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-md transition-colors`}
        aria-label="Download options"
        disabled={!comicPanels || comicPanels.length === 0 || isGenerating}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </>
        )}
      </button>
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
        title="Download Options"
      >
        <div className="space-y-6">
          <ComicPdfDownloader 
            comicPanels={comicPanels} 
            title={title}
            onGeneratingChange={setIsGenerating}
            onComplete={() => setIsSidebarOpen(false)}
          />
          
          <div className="border-t border-gray-700 my-6"></div>
          
          <ImageDownloader 
            comicPanels={comicPanels} 
            title={title}
            onGeneratingChange={setIsGenerating}
            onComplete={() => setIsSidebarOpen(false)}
          />
        </div>
      </Sidebar>
    </>
  );
};

// Export is handled at the component declaration
