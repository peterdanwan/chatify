// frontend/src/components/ChatsList.jsx

import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';
import NoChatsFound from './NoChatsFound';
import UserButton from './UserButton';

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading } = useChatStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) {
    return <UsersLoadingSkeleton />;
  }

  if (chats.length === 0) {
    return <NoChatsFound />;
  }

  return (
    <div id="chats-list" className="flex-1 overflow-y-auto p-4 space-y-2">
      {chats.map((chat) => (
        <UserButton key={chat._id} user={chat} />
      ))}
    </div>
  );
}
export default ChatsList;
