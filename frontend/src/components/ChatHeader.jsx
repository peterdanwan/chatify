// frontend/src/components/ChatHeader.jsx

import { XIcon } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useEffect } from 'react';

export default function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();

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
      className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-21 px-6 flex-1"
    >
      <div className="flex items-center space-x-3 ">
        <div className="avatar avatar-online">
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
          <h3 className="text-slate-200 font-medium">{`${selectedUser.firstName} ${selectedUser.lastName}`}</h3>
          <p className="text-slate-400 text-sm">Online</p>
        </div>

        <div
          className="tooltip tooltip-right tooltip-info bg-transparent pt-2"
          data-tip="Press the Escape Key to close the conversation"
        >
          <button
            onClick={() => {
              setSelectedUser(null);
            }}
            className="cursor-pointer "
          >
            <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors " />
          </button>
        </div>
      </div>
    </div>
  );
}
