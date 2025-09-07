
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { AIIcon } from './icons/AIIcon';
import { generateChatResponse, generateChatResponseStream } from '../services/geminiService';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatAreaProps {
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
}

export interface ChatAreaRef {
  addGenerationComplete: () => void;
}

export const ChatArea = forwardRef<ChatAreaRef, ChatAreaProps>(({ onSendMessage, isGenerating }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isGenerating) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: inputValue,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      const messageToSend = inputValue;
      onSendMessage(messageToSend);
      setInputValue('');

      const aiMessageId = (Date.now() + 1).toString();
      const aiMessagePlaceholder: Message = {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessagePlaceholder]);

      try {
        const stream = generateChatResponseStream(messageToSend);
        let currentContent = "";
        for await (const chunk of stream) {
          currentContent += chunk;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, content: currentContent }
                : msg
            )
          );
        }
      } catch (error) {
        console.error('Error generating AI response:', error);
        const errorMessage: Message = {
          id: aiMessageId, // Replace placeholder with error
          type: 'ai',
          content: 'Sorry, I encountered an error. Please try again!',
          timestamp: new Date()
        };
        setMessages(prev => prev.map(msg => msg.id === aiMessageId ? errorMessage : msg));
      }
    }
  };

  const addGenerationComplete = async () => {
    try {
      const completionResponse = await generateChatResponse("Comic generation completed successfully! The user can now see their comic panels.");
      const summaryMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: completionResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, summaryMessage]);
    } catch (error) {
      console.error('Error generating completion message:', error);
      const summaryMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: '✨ Comic generation completed! Your comic panels are now displayed in the comic panel area. I hope you enjoy your personalized comic story!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, summaryMessage]);
    }
  };

  useImperativeHandle(ref, () => ({
    addGenerationComplete
  }));

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8 flex flex-col items-center">
            <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-yellow-400 opacity-30" />
            <h3 className="text-lg font-semibold text-gray-200">Start Your Comic Creation</h3>
            <p className="max-w-xs mt-1">
              Provide a script in the text box below. Use the format <code className="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded text-sm">character: dialogue</code> for each line to bring your story to life.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {message.type === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <AIIcon className="w-5 h-5 text-yellow-400" />
                  </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-yellow-400 text-black font-semibold rounded-br-none'
                    : 'bg-gray-800 text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                 <p className={`text-xs mt-2 text-right ${
                  message.type === 'user' ? 'text-yellow-900' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        {isGenerating && messages.every(m => m.type === 'user') && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                <AIIcon className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="bg-gray-800 text-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse ml-1.5" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse ml-1.5" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700">
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Cat: I see a friendly dog!..."
            className="w-full bg-slate-900/80 border border-slate-600 rounded-lg p-3 pr-28 text-sm text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:outline-none resize-none transition-colors"
            rows={3}
            disabled={isGenerating}
          />
          <button
            onClick={handleSendMessage}
            disabled={isGenerating || !inputValue.trim()}
            className="absolute right-3 bottom-2.5 bg-yellow-400 text-black font-bold py-2 px-4 rounded-md text-sm hover:bg-yellow-300 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isGenerating ? 'Creating...' : 'Send'}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});
