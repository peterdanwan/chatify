// frontend/src/components/ChatHeader.jsx

import { useEffect } from 'react';
import { CircleUserRound, XIcon } from 'lucide-react';

import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

export default function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = selectedUser?._id ? onlineUsers.includes(String(selectedUser._id)) : false;
  // const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setSelectedUser(null);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => removeEventListener('keydown', handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      id="chat-header"
      className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-21 flex-1"
    >
      <div className="flex items-center gap-2 pl-4 ">
        <div className={`avatar ${isOnline ? 'avatar-online' : 'avatar-offline'}`}>
          <div className="w-12 rounded-full">
            {selectedUser.profilePic ? (
              <img
                src={selectedUser.profilePic}
                alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                className="size-full object-cover"
              />
            ) : (
              // Ref: https://lucide.dev/icons/circle-user-round
              <CircleUserRound strokeWidth={1.2} className="size-full" />
            )}
          </div>
        </div>
        <div>
          <h3
            className="text-slate-200 font-medium tooltip tooltip-top"
            data-tip={`${selectedUser.firstName} ${selectedUser.lastName}`}
          >{`${selectedUser.firstName} ${selectedUser.lastName}`}</h3>
          <p className="text-slate-400 text-sm">{isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>
      <div className="bg-transparent pt-2 mr-5 ">
        <button
          onClick={() => {
            setSelectedUser(null);
          }}
          className="cursor-pointer tooltip tooltip-left tooltip-info "
          data-tip="Press the Escape Key to close the conversation"
        >
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors " />
        </button>
      </div>
    </div>
  );
}
