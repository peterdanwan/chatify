// frontend/src/pages/ChatPage.jsx

import { useAuthStore } from '../store/useAuthStore';

function ChatPage() {
  const { logout } = useAuthStore();

  return (
    <div className="z-10">
      ChatPage
      <button className="auth-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
export default ChatPage;
