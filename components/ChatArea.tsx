import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { generateChatResponse, generateChatResponseStream } from '../services/geminiService';
import { RiSendPlane2Fill } from "react-icons/ri";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { RiGeminiFill } from "react-icons/ri";

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
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);

  // Example prompts with preview and full content
  const examplePrompts = [
    {
      id: 1,
      title: "Superhero Argument",
      fullContent: `Hero: "You took my coffee order!"
Villain: "We both ordered lattes, it happens."

Hero: "But yours is regular and mine is decaf!"
Villain: "Oh please, like YOU need less energy."

Hero: "I can't believe we go to the same coffee shop."
Villain: "They have the best muffins. Even evil has standards."`
    },
    {
      id: 2,
      title: "Space Adventure",
      fullContent: `Captain: "What's that glowing object on the scanner?"
Pilot: "It looks like... wait, is that a pizza?"

Captain: "How is there a pizza floating in space?!"
Pilot: "Maybe the aliens got delivery?"

Captain: "Should we... collect it as a specimen?"
Pilot: "Or we could just have lunch. I'm starving."`
    },
    {
      id: 3,
      title: "Talking Animals",
      fullContent: `Cat: "The red dot isn't real, you know."
Dog: "Next you'll tell me the mailman isn't a threat."

Cat: "We're philosophical opposites. I question everything."
Dog: "And I accept everything with enthusiasm!"

Cat: "That's why you're happy and I'm... well, me."
Dog: "Want to chase the humans together anyway?"`
    }
  ];

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll when messages change
  useEffect(() => {
    // Add a small delay to ensure new content is rendered before scrolling
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
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
  
  // Auto-resize textarea to fit content without scrollbar
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the actual content height
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200;
      const newHeight = Math.min(scrollHeight, maxHeight);
      
      // Set the height
      textarea.style.height = `${newHeight}px`;
      
      // If we're expanding upward, we need to adjust the container
      if (scrollHeight > 56) { // 56px is the minimum height
        textarea.style.scrollTop = textarea.scrollHeight; // Keep cursor visible
      }
    }
  };
  
  useEffect(() => {
    autoResizeTextarea();
  }, [inputValue]);

  // Toggle expanded prompt
  const togglePrompt = (id: number) => {
    setExpandedPrompt(expandedPrompt === id ? null : id);
  };

  // Use an example prompt
  const useExamplePrompt = (promptContent: string) => {
    setInputValue(promptContent);
    setExpandedPrompt(null); // Close the dropdown
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-4 space-y-4 md:space-y-4 scrollbar-custom touch-scroll">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-4 md:mt-4 flex flex-col items-center">
            <img src="/logo.png" alt="Delulu Logo" className="w-32 h-24 mx-auto mb-6 md:w-30 md:h-16 mx-auto mb-1 md:mb-2" />
            <h3 className="text-lg md:text-lg font-semibold text-gray-200">Start Your Comic Creation</h3>
            <p className="max-w-xs mt-2 mb-4 md:mb-3 text-sm md:text-sm">
              Use <code className="bg-gray-700 text-yellow-300 px-2 py-1 rounded text-sm">character: dialogue</code> format in your script.
            </p>
            <div className="w-full max-w-md mt-2 md:mt-2">
              <h4 className="text-gray-300 font-semibold text-sm md:text-sm text-left mb-3 md:mb-2">Try these examples:</h4>
              <div className="grid grid-cols-1 gap-3 md:gap-2">
                {examplePrompts.map(prompt => (
                  <div key={prompt.id} className="bg-gray-800/70 rounded-lg border border-gray-700 overflow-hidden">
                    <div 
                      className="p-4 md:p-2 flex justify-between items-center cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => togglePrompt(prompt.id)}
                    >
                      <div className="flex-1">
                        <h5 className="font-medium text-yellow-400 text-base md:text-base">{prompt.title}</h5>
                      </div>
                      <button className="p-2 md:p-1 rounded-full hover:bg-gray-700 text-gray-400">
                        {expandedPrompt === prompt.id ? <RiArrowUpSLine size={20} /> : <RiArrowDownSLine size={20} />}
                      </button>
                    </div>
                    {expandedPrompt === prompt.id && (
                      <div className="border-t border-gray-700 p-4 md:p-2 text-left">
                        <pre className="text-sm md:text-sm text-gray-300 whitespace-pre-wrap font-sans mb-3 md:mb-2 text-left max-h-32 overflow-y-auto">{prompt.fullContent.trim()}</pre>
                        <button 
                          onClick={() => useExamplePrompt(prompt.fullContent.trim())}
                          className="text-sm md:text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-4 md:px-3 py-2 md:py-1.5 rounded transition-colors"
                        >
                          Use this prompt
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 md:gap-3 message-bubble ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {message.type === 'ai' && (
                  <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <RiGeminiFill size={20} />
                  </div>
              )}
              <div
                className={`max-w-[85%] px-4 py-3 md:px-4 md:py-3 rounded-xl md:rounded-2xl message-bubble ${
                  message.type === 'user'
                    ? 'bg-gray-800 text-yellow-500 rounded-bl-none'
                    : 'bg-gray-800 text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm md:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs md:text-xs mt-2 md:mt-2 text-right ${
                  message.type === 'user' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        {isGenerating && messages.every(m => m.type === 'user') && (
          <div className="flex items-start gap-3">
             <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                <RiGeminiFill size={20} />
            </div>
            <div className="bg-gray-800 text-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse-delay-1 ml-2"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse-delay-2 ml-2"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 shrink-0">
        <div className="p-4 md:p-4">
          <div className="relative textarea-container">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Cat: I see a friendly dog!..."
              className="w-full bg-slate-900/80 border border-slate-600 rounded-lg p-4 md:p-3 pr-16 md:pr-16 text-base md:text-sm text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:outline-none resize-none textarea-expand-up overflow-y-auto scrollbar-custom"
              style={{ 
                minHeight: '56px', 
                maxHeight: '200px'
              }}
              disabled={isGenerating}
            />
            <button
              onClick={handleSendMessage}
              disabled={isGenerating || !inputValue.trim()}
              className="absolute right-3 md:right-3 bottom-4 md:bottom-3 bg-yellow-400 text-black font-bold p-3 md:p-2 rounded-md text-sm hover:bg-yellow-300 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center z-10"
              title="Send message"
            >
              <RiSendPlane2Fill size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
