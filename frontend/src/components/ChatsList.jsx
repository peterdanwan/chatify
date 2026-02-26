// frontend/src/components/ChatsList.jsx

import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';
import NoChatsFound from './NoChatsFound';
import UserButton from './UserButton';
import { filterByName } from '../lib/utils';

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, nameFilter } = useChatStore();

  const filteredChats = filterByName(chats, nameFilter);

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) {
    return <UsersLoadingSkeleton />;
  }

  if (filteredChats.length === 0) {
    return <NoChatsFound />;
  }

  return (
    <div id="chats-list" className="flex-1 overflow-y-auto p-4 space-y-2">
      {filteredChats.map((chat) => (
        <UserButton key={chat._id} user={chat} />
      ))}
    </div>
  );
}
export default ChatsList;
