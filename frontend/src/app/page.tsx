'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../component/Headers';
import Sidebar from '../../component/Sidebar';
import ChatArea from '../../component/ChatArea';
import Footer from '../../component/Footer';
import { Conversation, Message } from '../../component/types';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed);

      // Set the most recent conversation as current
      if (parsed.length > 0) {
        setCurrentConversation(parsed[0]);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date().toLocaleDateString(),
      messages: []
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  };

  const handleSelectChat = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const handleDeleteChat = (id: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);

    if (currentConversation?.id === id) {
      if (updatedConversations.length > 0) {
        setCurrentConversation(updatedConversations[0]);
      } else {
        setCurrentConversation(null);
      }
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSendMessage = async (content: string) => {
    let activeConversation = currentConversation;

    // Auto-create a new conversation if none exists
    if (!activeConversation) {
      activeConversation = {
        id: Date.now().toString(),
        title: 'New Chat',
        timestamp: new Date().toLocaleDateString(),
        messages: []
      };
      setConversations(prev => [activeConversation!, ...prev]);
      setCurrentConversation(activeConversation);
    }

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    let updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMessage]
    };

    // Set title from first message if it's the first message
    if (activeConversation.messages.length === 0) {
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      updatedConversation.title = title;
    }

    setCurrentConversation(updatedConversation);
    setConversations(prev => {
      const updated = [...prev];
      const index = updated.findIndex(conv => conv.id === updatedConversation.id);
      if (index !== -1) {
        updated[index] = updatedConversation;
      }
      return updated;
    });

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query: content,
          verbose: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data); // Debug log

      // Handle both string and object responses from backend
      let botContent = '';
      
      if (typeof data.answer === 'string') {
        botContent = data.answer;
      } else if (typeof data.answer === 'object' && data.answer.answer) {
        botContent = data.answer.answer;
      } else {
        botContent = JSON.stringify(data.answer) || 'Sorry, I couldn\'t process your request.';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botContent,
        timestamp: new Date().toISOString()
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, botMessage]
      };

      setCurrentConversation(finalConversation);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === finalConversation.id ? finalConversation : conv
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `Sorry, I encountered an error connecting to the server. Error: ${error}`,
        timestamp: new Date().toISOString()
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorMessage]
      };

      setCurrentConversation(finalConversation);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === finalConversation.id ? finalConversation : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-background))]">
      <Sidebar
        conversations={conversations}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        currentConversationId={currentConversation?.id}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={isSidebarCollapsed ? handleToggleSidebar : undefined} />
        <ChatArea
          messages={currentConversation?.messages || []}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
        <Footer />
      </div>
    </div>
  );
}
