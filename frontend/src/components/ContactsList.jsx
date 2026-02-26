// frontend/src/components/ContactsList.jsx

import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';
import NoChatsFound from './NoChatsFound';
import UserButton from './UserButton';
import { filterByName } from '../lib/utils';

function ContactsList() {
  const { getAllContacts, allContacts, isUsersLoading, nameFilter } = useChatStore();

  const filteredContacts = filterByName(allContacts, nameFilter);

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) {
    return <UsersLoadingSkeleton />;
  }

  if (filteredContacts.length === 0) {
    return <NoChatsFound />;
  }

  return (
    <div id="contacts-list" className="flex-1 overflow-y-auto p-4 space-y-2">
      {filteredContacts.map((contact) => (
        <UserButton key={contact._id} user={contact} />
      ))}
    </div>
  );
}
export default ContactsList;
