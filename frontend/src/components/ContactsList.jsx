// frontend/src/components/ContactsList.jsx

import { useEffect, useState } from 'react';
import { UserPlusIcon, CheckIcon, XIcon } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';
import UserButton from './UserButton';
import { filterByName } from '../lib/utils';

function ContactsList() {
  const {
    getContacts,
    contacts,
    getIncomingRequests,
    incomingRequests,
    acceptContactRequest,
    removeContact,
    sendContactRequest,
    isSendingRequest,
    isUsersLoading,
    nameFilter,
  } = useChatStore();

  const [usernameInput, setUsernameInput] = useState('');

  const filteredContacts = filterByName(contacts, nameFilter);

  useEffect(() => {
    getContacts();
    getIncomingRequests();
  }, [getContacts, getIncomingRequests]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    const success = await sendContactRequest(usernameInput.trim());
    if (success) setUsernameInput('');
  };

  return (
    <div id="contacts-list" className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Add a contact by their username */}
      <form onSubmit={handleAddContact} className="flex gap-2">
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

      {/* Incoming contact requests */}
      {incomingRequests.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wide">
            Contact requests
          </h4>
          {incomingRequests.map((request) => (
            <div
              key={request._id}
              className="flex items-center justify-between gap-2 bg-cyan-500/10 p-3 rounded-lg"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={request.requester?.profilePic || '/avatar.png'}
                  alt={request.requester?.displayName}
                  referrerPolicy="no-referrer"
                  className="size-8 rounded-full object-cover shrink-0"
                />
                <span className="text-slate-200 text-sm truncate">
                  {request.requester?.displayName}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => acceptContactRequest(request._id)}
                  className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors cursor-pointer tooltip tooltip-top"
                  data-tip="Accept"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeContact(request._id)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer tooltip tooltip-top"
                  data-tip="Reject"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accepted contacts */}
      {isUsersLoading ? (
        <UsersLoadingSkeleton />
      ) : filteredContacts.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">
          No contacts yet — add someone above by their username.
        </p>
      ) : (
        <div className="space-y-2">
          {filteredContacts.map((contact) => (
            <UserButton key={contact._id} user={contact} />
          ))}
        </div>
      )}
    </div>
  );
}
export default ContactsList;
