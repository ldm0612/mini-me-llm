import React, { useState } from 'react';
import { SidebarProps } from './types';
import { FiPlus, FiMessageSquare, FiX, FiTrash2, FiMenu } from 'react-icons/fi';

export default function Sidebar({ 
  conversations, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat,
  currentConversationId,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  if (isCollapsed) {
    return (
      <aside className="w-16 bg-[rgb(var(--color-background))] border-r border-[rgb(var(--color-secondary))] flex flex-col h-full">
        <div className="p-4 border-b border-[rgb(var(--color-secondary))]">
          <button 
            onClick={onNewChat} 
            className="w-full flex items-center justify-center bg-[rgb(var(--color-primary))] text-white p-2 rounded-lg hover:bg-opacity-80 transition-colors"
            title="New Chat"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <div key={conv.id} className="mb-2">
              <button
                onClick={() => onSelectChat(conv.id)}
                className={`w-full p-2 rounded-lg text-xs transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-[rgba(var(--color-primary),0.15)] text-[rgb(var(--color-primary))] font-semibold border border-[rgba(var(--color-primary),0.4)]'
                    : 'text-[rgb(var(--color-text-primary))] hover:bg-[rgba(var(--color-secondary),0.1)]'
                }`}
                title={conv.title}
              >
                <FiMessageSquare className="w-4 h-4 mx-auto" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-2 border-t border-[rgb(var(--color-secondary))]">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-secondary),0.1)] rounded-lg transition-colors"
            title="Expand Sidebar"
          >
            <FiMenu className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-[rgb(var(--color-background))] border-r border-[rgb(var(--color-secondary))] flex flex-col h-full">
      {/* Header with toggle button */}
      <div className="p-4 border-b border-[rgb(var(--color-secondary))] flex items-center justify-between">
        <button 
          onClick={onNewChat} 
          className="flex items-center justify-center gap-2 bg-[rgb(var(--color-primary))] text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors flex-1"
        >
          <FiPlus className="w-4 h-4" />
          New Chat
        </button>
        <button
          onClick={onToggleCollapse}
          className="ml-2 p-2 text-[rgb(var(--color-text-secondary))] hover:bg-[rgba(var(--color-secondary),0.1)] rounded-lg transition-colors"
          title="Collapse Sidebar"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Previous Conversations */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] mb-3 uppercase tracking-wide">
          Previous 7 Days
        </div>
        
        {conversations.length === 0 ? (
          <div className="text-center text-[rgb(var(--color-text-secondary))] text-sm py-8">
            <FiMessageSquare className="w-8 h-8 mx-auto mb-2 text-[rgba(var(--color-secondary),0.4)]" />
            <p>No conversations yet</p>
            <p className="text-xs">Start a new chat to begin</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <div
                  className={`group relative flex items-center ${
                    currentConversationId === conv.id
                      ? 'bg-[rgba(var(--color-primary),0.15)] border border-[rgba(var(--color-primary),0.4)]'
                      : 'hover:bg-[rgba(var(--color-secondary),0.1)]'
                  } rounded-lg transition-colors`}
                  onMouseEnter={() => setHoveredChat(conv.id)}
                  onMouseLeave={() => setHoveredChat(null)}
                >
                  <button
                    onClick={() => onSelectChat(conv.id)}
                    className="flex-1 text-left px-3 py-2 text-sm text-[rgb(var(--color-text-primary))] transition-colors"
                  >
                    <div className="font-semibold truncate">{conv.title}</div>
                    <div className="text-xs text-[rgba(var(--color-text-secondary),0.8)]">{conv.timestamp}</div>
                  </button>
                  
                  {hoveredChat === conv.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(conv.id);
                      }}
                      className="p-1 text-[rgba(var(--color-text-secondary),0.7)] hover:text-red-500 transition-colors mr-2"
                      title="Delete Chat"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
