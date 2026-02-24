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
    <div id="chat-page" className="relative w-full max-w-6xl h-dvh lg:h-200">
      <BorderAnimatedContainer>
        {/* LEFT SIDE — hidden on mobile when a user is selected */}
        <div
          id="left-side"
          className={`bg-slate-800/50 h-full backdrop-blur-sm flex flex-col lg:w-1/3 lg:flex ${
            selectedUser ? 'hidden' : 'flex'
          }`}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          {/* Container that shows Chats or Contacts  */}
          <div id="chats-or-contacts-container" className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === 'chats' ? <ChatsList /> : <ContactsList />}
          </div>
        </div>

        {/* RIGHT SIDE — shown on mobile when a user is selected, always shown on lg */}
        <div
          id="right-side"
          className={`flex-1 flex-col bg-slate-900/50 backdrop-blur-sm lg:w-2/3 overflow-y-auto justify-center lg:flex ${
            selectedUser ? 'flex' : 'hidden'
          }`}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;
