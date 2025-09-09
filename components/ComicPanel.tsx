
import React, { useState, useEffect } from 'react';
import type { ComicPanelData } from '../types';
import { generatePanelImage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface ComicPanelProps {
  panelData: ComicPanelData;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({ panelData }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      // Add a small delay to subsequent panels to avoid potential rate limiting
      if(panelData.panel > 1) {
        await new Promise(resolve => setTimeout(resolve, (panelData.panel - 1) * 500));
      }

      setIsImageLoading(true);
      setImageError(null);
      try {
        const url = await generatePanelImage(panelData.image_generation_prompt);
        setImageUrl(url);
      } catch (err) {
        setImageError('Could not load image.');
        console.error(`Failed to generate image for panel ${panelData.panel}`, err);
      } finally {
        setIsImageLoading(false);
      }
    };

    fetchImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelData.image_generation_prompt, panelData.panel]);

  const ImageDisplay: React.FC = () => {
    if (isImageLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <LoadingSpinner />
          <p className="text-sm mt-2 text-slate-400">Drawing panel...</p>
        </div>
      );
    }
    if (imageError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-red-900/50 text-red-300 p-4 text-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {imageError}
        </div>
      );
    }
    if (imageUrl) {
      return <img 
        id={`comic-panel-image-${panelData.panel}`}
        src={imageUrl} 
        alt={panelData.scene} 
        className="w-full h-full object-cover" 
      />;
    }
    return null;
  };

  return (
    <div 
      id={`comic-panel-${panelData.panel}`}
      className="bg-slate-800 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-yellow-400 ring-1 ring-yellow-400/10"
    >
      <div className="aspect-square w-full h-auto bg-slate-800 flex items-center justify-center relative">
        <ImageDisplay />
      </div>
      <div className="p-4 flex-grow">
        <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-100 shrink-0">Panel {panelData.panel}</h3>
        </div>
      </div>
    </div>
  );
};
