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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
        <div className="col-span-1 md:col-span-2 flex justify-end mb-4">
          <ComicDownloader 
            comicPanels={panels.map(panel => ({
              id: panel.panel,
              text: panel.scene,
              // No need to pass image URL as we'll capture using html2canvas
            }))} 
            title="My Comic Strip"
          />
        </div>
        {panels.map((panelData) => (
          <ComicPanel key={panelData.panel} panelData={panelData} />
        ))}
      </div>
    );
  };
  
  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};