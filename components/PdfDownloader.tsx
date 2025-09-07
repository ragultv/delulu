import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ComicPdfDownloaderProps {
  comicPanels: Array<{
    image?: string;
    text?: string;
    id: number;
  }>;
  title: string;
  onComplete: () => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

export const ComicPdfDownloader: React.FC<ComicPdfDownloaderProps> = ({ 
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
  
  const generateComicLayoutPDF = async () => {
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
      loadingToast.style.background = '#4338ca';
      loadingToast.style.color = 'white';
      loadingToast.style.borderRadius = '5px';
      loadingToast.style.zIndex = '9999';
      loadingToast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      loadingToast.textContent = 'Generating comic layout PDF...';
      document.body.appendChild(loadingToast);

      // Create PDF document with A4 size in landscape
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // margin in mm
      
      // Capture panel images
      const panels = [];
      for (let i = 0; i < comicPanels.length; i++) {
        const panelId = comicPanels[i].id;
        
        // Try to get the image element
        const imageElement = document.getElementById(`comic-panel-image-${panelId}`);
        if (imageElement) {
          // Capture as canvas with high resolution
          const canvas = await html2canvas(imageElement, {
            scale: 3,
            allowTaint: true,
            useCORS: true,
            backgroundColor: null
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          panels.push({
            id: panelId,
            imgData,
            width: canvas.width,
            height: canvas.height
          });
        }
      }
      
      // Calculate dimensions for a 2x2 grid layout
      const effectiveWidth = pageWidth - (margin * 3); // Space for 2 panels plus margins
      const effectiveHeight = pageHeight - (margin * 3); // Space for 2 panels plus margins
      
      const panelWidth = effectiveWidth / 2;
      const panelHeight = effectiveHeight / 2;
      
      // Layout panels in a 2x2 grid
      for (let i = 0; i < Math.min(panels.length, 4); i++) {
        const panel = panels[i];
        const row = Math.floor(i / 2); // 0 for first row, 1 for second row
        const col = i % 2; // 0 for left column, 1 for right column
        
        // Calculate position for this panel
        const xPos = margin + (col * (panelWidth + margin));
        const yPos = margin + (row * (panelHeight + margin));
        
        // Determine scaling to maintain aspect ratio
        const aspectRatio = panel.width / panel.height;
        let imgWidth = panelWidth;
        let imgHeight = panelWidth / aspectRatio;
        
        if (imgHeight > panelHeight) {
          imgHeight = panelHeight;
          imgWidth = panelHeight * aspectRatio;
        }
        
        // Center the image in its cell
        const xOffset = xPos + ((panelWidth - imgWidth) / 2);
        const yOffset = yPos + ((panelHeight - imgHeight) / 2);
        
        // Add image to PDF
        pdf.addImage(
          panel.imgData,
          'JPEG',
          xOffset,
          yOffset,
          imgWidth,
          imgHeight
        );
        
        // Add panel number in small label at bottom right
        pdf.setFillColor(0, 0, 0, 0.7);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(`${panel.id}`, xPos + panelWidth - 5, yPos + panelHeight - 3, { align: 'right' });
      }
      
      // Add title to bottom of page
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(title, pageWidth / 2, pageHeight - 5, { align: 'center' });
      
      // Save PDF
      pdf.save(`${title.replace(/\s+/g, '_')}_comic_layout.pdf`);
      
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
      successToast.textContent = 'Comic layout PDF generated!';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);
      
    } catch (error) {
      console.error('Error generating comic layout PDF:', error);
      alert('Error generating comic layout PDF. Check console for details.');
      setIsGenerating(false);
      onComplete();
    }
  };

  return (
    <button
      onClick={generateComicLayoutPDF}
      disabled={isGenerating}
      className={`flex items-center justify-between w-full px-6 py-4 ${
        isGenerating ? 'bg-gray-700 cursor-not-allowed' : 'bg-indigo-600/20 hover:bg-indigo-600/30'
      } text-white rounded-lg border border-indigo-500/30 transition-colors mb-4`}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 mr-4 flex items-center justify-center text-indigo-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </div>
        <div className="text-left">
          <span className="block text-white font-medium">Download as PDF</span>
          <span className="text-xs text-slate-300">Comic panels in 2×2 grid layout</span>
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
