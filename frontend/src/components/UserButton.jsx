// frontend/src/components/UserButton.jsx

import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

function UserButton({ user }) {
  const { setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <button
      key={user._id}
      className="w-full bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 focus-visible:bg-cyan-500/20 transition-colors tooltip tooltip-info tooltip-bottom"
      onClick={() => setSelectedUser(user)}
      data-tip={user.displayName}
    >
      <div className="flex items-center gap-3">
        <div
          className={`avatar ${onlineUsers.includes(user._id) ? 'avatar-online' : 'avatar-offline'}`}
        >
          <div className="size-12 rounded-full">
            <img
              src={user.profilePic || '/avatar.png'}
              alt={user.displayName}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <h4 className="text-slate-200 font-medium truncate">{user.displayName}</h4>
      </div>
    </button>
  );
}
export default UserButton;
