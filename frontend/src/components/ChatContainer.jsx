// frontend/src/components/ChatContainer.jsx

import ChatHeader from './ChatHeader';
import ChatBody from './ChatBody';
import MessageInput from './MessageInput';

function ChatContainer() {
  return (
    <div id="chat-container" className="flex flex-col flex-1 overflow-y-auto">
      <ChatHeader />
      <ChatBody />
      <MessageInput />
    </div>
  );
}
export default ChatContainer;
