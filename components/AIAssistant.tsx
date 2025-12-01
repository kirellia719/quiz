import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, ImageIcon, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your AI assistant. I can answer questions or analyze images for you.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const responseText = await GeminiService.chat(userMsg.text || "Analyze this image", userMsg.image);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error connecting to Gemini.",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50 flex items-center gap-2"
      >
        <MessageSquare size={24} />
        <span className="font-semibold hidden sm:inline">AI Help</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'w-72 h-14 overflow-hidden' : 'w-[90vw] sm:w-96 h-[600px] max-h-[80vh]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-indigo-600 text-white rounded-t-lg shrink-0">
        <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare size={18} /> 
            AI Assistant
        </h3>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-indigo-200">
                {isMinimized ? <Maximize2 size={18}/> : <Minimize2 size={18} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="hover:text-indigo-200">
                <X size={18} />
            </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                        msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    } ${msg.isError ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                    >
                    {msg.image && (
                        <img 
                            src={msg.image} 
                            alt="Uploaded" 
                            className="w-full h-auto max-h-48 object-cover rounded mb-2 border border-white/20" 
                        />
                    )}
                    <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                    </div>
                </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none shadow-sm flex items-center gap-2">
                            <Loader2 className="animate-spin text-indigo-600" size={16} />
                            <span className="text-gray-500 text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                {selectedImage && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded text-sm text-gray-600">
                        <ImageIcon size={16} />
                        <span className="truncate max-w-[200px]">Image attached</span>
                        <button onClick={() => setSelectedImage(null)} className="ml-auto hover:text-red-500">
                            <X size={16} />
                        </button>
                    </div>
                )}
                <div className="flex gap-2">
                    <label className="cursor-pointer text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelect}
                        />
                        <ImageIcon size={24} />
                    </label>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || (!inputText.trim() && !selectedImage)}
                        className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};