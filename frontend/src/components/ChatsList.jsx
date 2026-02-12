// frontend/src/components/ChatsList.jsx

import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';
import NoChatsFound from './NoChatsFound';

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

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
        <button
          key={chat._id}
          className="w-full bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            {/* TODO: FIX THIS ONLINE STATUS AND MAKE IT WORK WITH SOCKET */}
            <div
              className={`avatar ${onlineUsers.includes(chat._id) ? 'avatar-online' : 'avatar-offline'}`}
            >
              <div className="size-12 rounded-full">
                <img
                  src={chat.profilePic || '/avatar.png'}
                  alt={`${chat.firstName} ${chat.lastName}`}
                />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{`${chat.firstName} ${chat.lastName}`}</h4>
          </div>
        </button>
      ))}
    </>
  );
}
export default ChatsList;
