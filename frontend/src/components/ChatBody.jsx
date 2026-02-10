// frontend/src/components/ChatBody.jsx

import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton';
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder';
import ChatMessage from './ChatMessage';

export default function ChatBody() {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading } = useChatStore();

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
  }, [selectedUser, getMessagesByUserId]);

  return (
    <div id="chat-body" className="flex-1 px-6 overflow-y-auto py-8">
      {messages.length > 0 && !isMessagesLoading ? (
        <div id="chat-messages" className="max-w-3xl mx-auto space-y-6">
          {[...messages]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            // OLD: MongoDB does sort by chronological order, but we will use the sort method to ensure this is the case.
            // {messages.map((msg) => (
            .map((msg) => (
              <ChatMessage msg={msg} key={msg._id} />
            ))}
        </div>
      ) : isMessagesLoading ? (
        <MessagesLoadingSkeleton />
      ) : (
        <NoChatHistoryPlaceholder />
      )}
    </div>
  );
}
