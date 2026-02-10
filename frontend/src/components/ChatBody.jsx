// frontend/src/components/ChatBody.jsx

import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton';
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder';

export default function ChatBody() {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading } = useChatStore();
  const { authUser } = useAuthStore();

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
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}
              >
                <div
                  className={`chat-bubble relative ${msg.senderId === authUser._id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200'}`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-lg h-8 object-cover" />
                  )}
                  {msg.text && <p className="mt-1">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
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
