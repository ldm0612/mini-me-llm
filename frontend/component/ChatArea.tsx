import React, { useState, useRef, useEffect } from 'react';
import { ChatAreaProps } from './types';
import { FiSend, FiUser, FiMessageCircle } from 'react-icons/fi';

export default function ChatArea({ messages, onSendMessage, isLoading = false }: ChatAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[rgb(var(--color-background))] h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h2 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                Ask any question about me!
              </h2>
              <p className="text-[rgb(var(--color-text-secondary))]">
                I'm here to help you prepare for behavioral interviews.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'bot' && (
                  <div className="w-8 h-8 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center flex-shrink-0">
                    <FiMessageCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-[rgb(var(--color-primary))] text-white'
                      : 'bg-white text-[rgb(var(--color-text-primary))] shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-xl">{message.content}</p>
                  <div className="text-xs mt-2 text-[rgb(var(--color-text-secondary))]">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-[rgb(var(--color-secondary))] rounded-full flex items-center justify-center flex-shrink-0">
                    <FiUser className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white text-[rgb(var(--color-text-primary))] shadow-sm border border-gray-200 px-4 py-3 rounded-2xl">
                  <p className="flex space-x-0.5 italic">
                    {"Thinking...".split("").map((char, index) => (
                      <span
                        key={index}
                        className="inline-block animate-bounce"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {char}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message DM Bot..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
