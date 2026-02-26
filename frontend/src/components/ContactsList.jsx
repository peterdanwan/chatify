// frontend/src/components/ContactsList.jsx

import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';
import NoChatsFound from './NoChatsFound';
import UserButton from './UserButton';

function ContactsList() {
  const { getAllContacts, allContacts, isUsersLoading } = useChatStore();

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
    <div id="contacts-list" className="flex-1 overflow-y-auto p-4 space-y-2">
      {allContacts.map((contact) => (
        <UserButton key={contact._id} user={contact} />
      ))}
    </div>
  );
}
export default ContactsList;
