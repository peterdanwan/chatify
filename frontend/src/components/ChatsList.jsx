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
    <>
      {chats.map((chat) => (
        <UserButton key={chat._id} user={chat} />
      ))}
    </>
  );
}
export default ChatsList;
