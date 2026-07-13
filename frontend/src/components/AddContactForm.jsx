// frontend/src/components/AddContactForm.jsx

import { useState } from 'react';
import { UserPlusIcon } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';

function AddContactForm() {
  const { sendContactRequest, isSendingRequest } = useChatStore();
  const [usernameInput, setUsernameInput] = useState('');

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    const success = await sendContactRequest(usernameInput.trim());
    if (success) setUsernameInput('');
  };

  return (
    <form onSubmit={handleAddContact} className="flex gap-2 mx-4 mt-4">
      <div className="flex-1 rounded-full flex bg-cyan-500/20 items-center ring-2 ring-transparent focus-within:ring-cyan-400 transition-all hover:bg-cyan-500/40">
        <input
          type="text"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          placeholder="Add a new contact by username"
          className="w-full bg-transparent outline-none ps-4 py-2 text-white placeholder-white/50"
        />
      </div>
      <button
        type="submit"
        disabled={isSendingRequest || !usernameInput.trim()}
        className="px-3 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        data-tip="Send contact request"
      >
        <UserPlusIcon className="w-5 h-5" />
      </button>
    </form>
  );
}
export default AddContactForm;
