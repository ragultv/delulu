import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

interface ImageDownloaderProps {
  comicPanels: Array<{
    image?: string;
    text?: string;
    id: number;
  }>;
  title: string;
  onComplete: () => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

export const ImageDownloader: React.FC<ImageDownloaderProps> = ({ 
  comicPanels, 
  title,
  onComplete,
  onGeneratingChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Notify parent component about generating state changes
  useEffect(() => {
    if (onGeneratingChange) {
      onGeneratingChange(isGenerating);
    }
  }, [isGenerating, onGeneratingChange]);
  
  const downloadImages = async () => {
    if (!comicPanels || comicPanels.length === 0) {
      alert('No comic panels to download');
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Show loading message
      const loadingToast = document.createElement('div');
      loadingToast.style.position = 'fixed';
      loadingToast.style.top = '20px';
      loadingToast.style.right = '20px';
      loadingToast.style.padding = '15px 20px';
      loadingToast.style.background = '#10B981';
      loadingToast.style.color = 'white';
      loadingToast.style.borderRadius = '5px';
      loadingToast.style.zIndex = '9999';
      loadingToast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      loadingToast.textContent = 'Preparing images, please wait...';
      document.body.appendChild(loadingToast);
      
      // Create a new ZIP file
      const zip = new JSZip();
      
      // Capture all panel images
      for (let i = 0; i < comicPanels.length; i++) {
        const panelId = comicPanels[i].id;
        
        // Try to get just the image element 
        const imageElement = document.getElementById(`comic-panel-image-${panelId}`);
        if (imageElement) {
          // Capture as canvas with higher resolution for better quality
          const canvas = await html2canvas(imageElement, {
            scale: 3, // Higher resolution for better quality images
            allowTaint: true,
            useCORS: true,
            backgroundColor: null // Transparent background
          });
          
          // Convert canvas to blob
          const blob = await new Promise<Blob>(resolve => {
            canvas.toBlob(blob => {
              resolve(blob as Blob);
            }, 'image/jpeg', 0.95);
          });
          
          // Add image to zip
          zip.file(`panel-${panelId}.jpg`, blob);
        }
      }
      
      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Save the ZIP file
      saveAs(zipBlob, `${title.replace(/\s+/g, '_')}_panels.zip`);
      
      // Remove loading message
      document.body.removeChild(loadingToast);
      setIsGenerating(false);
      onComplete();
      
      // Show success message
      const successToast = document.createElement('div');
      successToast.style.position = 'fixed';
      successToast.style.top = '20px';
      successToast.style.right = '20px';
      successToast.style.padding = '15px 20px';
      successToast.style.background = '#10b981';
      successToast.style.color = 'white';
      successToast.style.borderRadius = '5px';
      successToast.style.zIndex = '9999';
      successToast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      successToast.textContent = 'Images downloaded successfully!';
      document.body.appendChild(successToast);
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);
      
    } catch (error) {
      console.error('Error generating ZIP:', error);
      alert('Error generating ZIP. Check console for details.');
      setIsGenerating(false);
      onComplete();
    }
  };

  return (
    <button
      onClick={downloadImages}
      disabled={isGenerating}
      className={`flex items-center justify-between w-full px-6 py-4 ${
        isGenerating ? 'bg-gray-700 cursor-not-allowed' : 'bg-emerald-600/20 hover:bg-emerald-600/30'
      } text-white rounded-lg border border-emerald-500/30 transition-colors`}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 mr-4 flex items-center justify-center text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <div className="text-left">
          <span className="block text-white font-medium">Download Images</span>
          <span className="text-xs text-slate-300">All panels as ZIP archive</span>
        </div>
      </div>
      {isGenerating && (
        <svg className="animate-spin h-5 w-5 text-white ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
    </button>
  );
};
