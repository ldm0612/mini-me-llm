export interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export interface SidebarProps {
  conversations: Conversation[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  currentConversationId?: string;
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
}

export interface HeaderProps {
  title?: string;
  onToggleSidebar?: () => void;
}

export interface FooterProps {
  resumeUrl?: string;
  linkedinUrl?: string;
}