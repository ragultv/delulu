
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ChatArea, ChatAreaRef } from './components/ChatArea';
import { ComicStrip } from './components/ComicStrip';
import { MobileLayout } from './components/MobileLayout';
import { generateComicPanels } from './services/geminiService';
import type { ComicPanelData } from './types';

const App: React.FC = () => {
  const [panels, setPanels] = useState<ComicPanelData[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const chatRef = useRef<ChatAreaRef>(null);

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

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) {
      setError('Please enter a script to create a comic.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setPanels([]);

    try {
      const generatedPanels = await generateComicPanels(message);
      setPanels(generatedPanels);
      
      // Notify comic generation complete
      if (chatRef.current) {
        chatRef.current.addGenerationComplete();
      }
      
    } catch (err) {
      console.error(err);
      setError('Failed to generate comic panels. Please check your script or try again later.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return (
    <div className="vh-100 bg-gradient-to-br from-gray-900 to-slate-800 text-white font-sans flex flex-col" style={{fontFamily: "'Nunito', sans-serif"}}>
  <Header />
  <main className="flex-1 min-h-0 flex flex-col">
        {isMobile ? (
          // Mobile Layout with Tabs
          <MobileLayout
            panels={panels}
            isGenerating={isGenerating}
            error={error}
            onSendMessage={handleSendMessage}
          />
        ) : (
          // Desktop Layout
          <>
            <div className="flex-1 p-4 flex flex-col md:flex-row gap-4 min-h-0">
              {/* Left Panel: Chat */}
              <div className="w-full md:w-2/5 lg:w-1/3 flex flex-col bg-slate-800/60 backdrop-blur-xl border border-yellow-400/10 rounded-2xl shadow-2xl">
                <div className="p-4 border-b border-yellow-400/20 bg-gray-900 rounded-t-2xl shrink-0">
                  <h2 className="text-lg font-bold text-yellow-400">Delulu Comic Creator </h2>
                  <p className="text-gray-400 text-sm">Powered by Nano-Banana</p>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <ChatArea 
                    ref={chatRef}
                    onSendMessage={handleSendMessage} 
                    isGenerating={isGenerating} 
                  />
                </div>
              </div>

              {/* Right Panel: Comic Strip */}
              <div className="w-full md:w-3/5 lg:w-2/3 flex flex-col bg-slate-800/60 backdrop-blur-xl border border-yellow-400/10 rounded-2xl shadow-2xl">
                <div className="p-4 border-b border-slate-700 shrink-0">
                  <h2 className="text-lg font-bold text-yellow-500">Your Comic Strip</h2>
                  <p className="text-gray-400 text-sm">Your AI-generated comic will appear here</p>
                </div>
                <div className="flex-1 min-h-0">
                  <div className="flex-1 flex flex-col min-h-0 overflow-y-auto touch-scroll overscroll-contain scrollbar-custom p-3">
                    <ComicStrip panels={panels} isLoading={isGenerating} error={error} />
                  </div>
                </div>
              </div>
            </div>
            <Footer isMobile={false} />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
