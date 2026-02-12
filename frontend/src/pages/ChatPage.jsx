// frontend/src/pages/ChatPage.jsx

// import { useAuthStore } from '../store/useAuthStore';
import ActiveTabSwitch from '../components/ActiveTabSwitch';
import BorderAnimatedContainer from '../components/BorderAnimatedContainer';
import ChatContainer from '../components/ChatContainer';
import ChatsList from '../components/ChatsList';
import ContactsList from '../components/ContactsList';
import NoConversationPlaceholder from '../components/NoConversationPlaceholder';
import ProfileHeader from '../components/ProfileHeader';
import { useChatStore } from '../store/useChatStore';

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div id="chat-page" className="relative w-full max-w-6xl h-200">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div id="left-side" className="w-90 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />

          {/* Container that shows Chats or Contacts  */}
          <div id="chats-or-contacts-container" className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === 'chats' ? <ChatsList /> : <ContactsList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div id="right-side" className="flex-1 flex flex-col bg-slate-900/50 backdroup-blur-sm">
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;
