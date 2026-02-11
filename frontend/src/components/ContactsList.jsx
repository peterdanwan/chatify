// frontend/src/components/ContactsList.jsx

import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';
import NoChatsFound from './NoChatsFound';

function ContactsList() {
  const { getAllContacts, allContacts, isUsersLoading, setSelectedUser } = useChatStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) {
    return <UsersLoadingSkeleton />;
  }

  if (allContacts.length === 0) {
    return <NoChatsFound />;
  }

  return (
    <>
      {allContacts.map((contact) => (
        <button
          key={contact._id}
          className="w-full bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            {/* TODO: FIX THIS ONLINE STATUS AND MAKE IT WORK WITH SOCKET */}
            <div className="avatar avatar-online ">
              <div className="size-12 rounded-full">
                <img
                  src={contact.profilePic || '/avatar.png'}
                  alt={`${contact.firstName} ${contact.lastName}`}
                />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{`${contact.firstName} ${contact.lastName}`}</h4>
          </div>
        </button>
      ))}
    </>
  );
}
export default ContactsList;
