// frontend/src/components/ChatBody.jsx

import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton';
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder';
import ChatMessage from './ChatMessage';

export default function ChatBody() {
  const {
    selectedUser,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
    messages,
    isMessagesLoading,
  } = useChatStore();

  // TODO: Review this part since ESLINT is giving an error
  // FIXED: Only depend on selectedUser._id, not the Zustand functions
  // Zustand functions are stable references, but ESLint doesn't know that
  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id]); // Only the ID changes when switching users

  const messageEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div id="chat-body" className="flex-1 px-6 overflow-y-auto py-8">
      {messages.length > 0 && !isMessagesLoading ? (
        <div id="chat-messages" className="max-w-3xl mx-auto space-y-6">
          {[...messages]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((msg) => (
              <ChatMessage msg={msg} key={msg._id} />
            ))}
          {/* We use this div to help us scroll to any new chat messages */}
          <div id="scroll-to-chat-div" ref={messageEndRef} />
        </div>
      ) : isMessagesLoading ? (
        <MessagesLoadingSkeleton />
      ) : (
        <NoChatHistoryPlaceholder />
      )}
    </div>
  );
}
