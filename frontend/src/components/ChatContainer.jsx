// frontend/src/components/ChatContainer.jsx

import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import ChatHeader from './ChatHeader';
import ChatBody from './ChatBody';
import MessageInput from './MessageInput';

function ChatContainer() {
  const { selectedUser, getMessagesByUserId } = useChatStore();

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
  }, [selectedUser, getMessagesByUserId]);

  return (
    <div id="chat-container" className="flex flex-col flex-1">
      <ChatHeader />
      <ChatBody />
      <MessageInput />
    </div>
  );
}
export default ChatContainer;
