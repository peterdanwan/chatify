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
    <>
      {allContacts.map((contact) => (
        <UserButton key={contact._id} user={contact} />
      ))}
    </>
  );
}
export default ContactsList;
