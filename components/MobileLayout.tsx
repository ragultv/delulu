import React, { useState, useRef } from 'react';
import { ChatArea, ChatAreaRef } from './ChatArea';
import { ComicStrip } from './ComicStrip';
import { Footer } from './Footer';
import type { ComicPanelData } from '../types';

interface MobileLayoutProps {
  panels: ComicPanelData[];
  isGenerating: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  panels, 
  isGenerating, 
  error, 
  onSendMessage 
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'comic'>('chat');
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const chatRef = useRef<ChatAreaRef>(null);

  // Show notification when comic is generated
  React.useEffect(() => {
    if (panels.length > 0 && !isGenerating) {
      setShowNotification(true);
      
      // Add a short delay to allow the comic to load, then show notification
      const timer = setTimeout(() => {
        // Don't automatically switch tabs - just show notification
        // setActiveTab('comic'); 
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [panels, isGenerating]);
  
  // Hide notification when switching to comic tab
  React.useEffect(() => {
    if (activeTab === 'comic') {
      setShowNotification(false);
    }
  }, [activeTab]);

  return (
  <div className="flex flex-col flex-1 min-h-0">
      {/* Fixed Tabs Header */}
      <div className="flex border-b border-slate-700 shrink-0 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          className={`flex-1 py-4 text-center font-medium transition-colors text-base ${
            activeTab === 'chat'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`flex-1 py-4 text-center font-medium transition-colors relative text-base ${
            activeTab === 'comic'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('comic')}
        >
          Comic Panels
          {showNotification && activeTab === 'chat' && (
            <div className="absolute top-2 right-1/4 flex items-center">
              <span className="h-3 w-3 bg-yellow-400 rounded-full animate-pulse mr-1"></span>
              <span className="text-sm text-yellow-400">New!</span>
            </div>
          )}
        </button>
      </div>

  {/* Scrollable Content */}
  <div className="flex-1 flex flex-col min-h-0 overflow-y-auto touch-scroll overscroll-contain scrollbar-custom h-full">
        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col min-h-0 ${
            activeTab === 'chat' ? 'flex' : 'hidden'
          }`}
        >
          <ChatArea
            ref={chatRef}
            onSendMessage={onSendMessage}
            isGenerating={isGenerating}
          />
        </div>

        {/* Comic Strip */}
        <div
          className={`flex-1 flex flex-col min-h-0 ${
            activeTab === 'comic' ? 'flex' : 'hidden'
          }`}
        >
          <div className="p-4 border-b border-slate-700 shrink-0 bg-gray-900/50 sticky top-0 z-10">
            <h2 className="text-xl font-bold text-yellow-500 text-center">Your Comic Strip</h2>
            <p className="text-gray-400 text-sm text-center">Your AI-generated comic will appear here</p>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-custom touch-scroll min-h-0">
            <div className="p-4">
              <ComicStrip panels={panels} isLoading={isGenerating} error={error} />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer - Always at bottom */}
      <Footer isMobile={true} />
    </div>
  );
};
