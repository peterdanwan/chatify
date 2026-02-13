// frontend/src/components/ChatMessage.jsx

import { useAuthStore } from '../store/useAuthStore';

function ChatMessage({ msg }) {
  const { authUser } = useAuthStore();

  return (
    <div
      className={`chat-message chat ${msg.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}
    >
      <div
        className={`chat-bubble relative ${msg.senderId === authUser._id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200'}`}
      >
        {msg.image && <img src={msg.image} alt="Shared" className="rounded-lg object-cover" />}
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
  );
}
export default ChatMessage;
