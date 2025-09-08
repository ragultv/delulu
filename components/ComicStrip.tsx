import React from 'react';
import type { ComicPanelData } from '../types';
import { ComicPanel } from './ComicPanel';
import { LoadingSpinner } from './LoadingSpinner';
import { ComicDownloader } from './ComicDownloader';

interface ComicStripProps {
  panels: ComicPanelData[];
  isLoading: boolean;
  error: string | null;
}

export const ComicStrip: React.FC<ComicStripProps> = ({ panels, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg font-semibold text-slate-300">Generating comic panels...</p>
          <p className="text-slate-400">The AI is warming up its pencils!</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full bg-red-900/30 border-2 border-red-700/50 rounded-lg p-6 text-center">
          <p className="text-red-300 font-semibold">{error}</p>
        </div>
      );
    }

    if (panels.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed border-slate-600 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-bold text-slate-200">Ready to create your comic?</h3>
          <p className="text-slate-400 mt-2">Write your story script in the chat panel. Your AI-generated comic will appear here!</p>
        </div>
      );
    }

    return (
      <div className="w-full max-w-full overflow-hidden">
        <div className="flex justify-end mb-2">
          <ComicDownloader 
            comicPanels={panels.map(panel => ({
              id: panel.panel,
              text: panel.scene,
              // No need to pass image URL as we'll capture using html2canvas
            }))} 
            title="My Comic Strip"
          />
        </div>
        {/* Desktop: 2-column grid, Mobile: single column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full comic-grid">
          {panels.map((panelData, index) => (
            <div key={panelData.panel} className="w-full min-w-0 overflow-hidden">
              {/* Mobile: show panel numbers, Desktop: hide them (they're shown in the panels themselves) */}
              <div className="mb-2 md:hidden">
                <p className="text-center text-yellow-400 font-medium text-sm bg-gray-800/50 rounded-full px-3 py-1 inline-block">Panel {index + 1}</p>
              </div>
              <div className="w-full max-w-sm md:max-w-full mx-auto shadow-xl rounded-lg overflow-hidden">
                <ComicPanel panelData={panelData} />
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">🎉 That's your complete comic story! 🎉</p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-0">
      {renderContent()}
    </div>
  );
};