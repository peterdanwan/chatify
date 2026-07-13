// frontend/src/components/SettingsModal.jsx
import { useState } from 'react';
import { Link } from 'react-router';

import Modal from './Modal';
import FormInput from './FormInput';
import SubmitButton from './SubmitButton';
import { useAuthStore } from '../store/useAuthStore';
import { UserIcon, AtSignIcon } from 'lucide-react';

function SettingsModal({ isOpen, onClose }) {
  const { authUser, updateAccount, isUpdatingAccount } = useAuthStore();
  const [displayName, setDisplayName] = useState(authUser?.displayName ?? '');
  const [username, setUsername] = useState(authUser?.username ?? '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Only send fields that actually changed, so an untouched field can't fail
    // someone else's uniqueness check (e.g. leaving username as-is).
    const changes = {};
    if (displayName !== authUser.displayName) changes.displayName = displayName;
    if (username !== authUser.username) changes.username = username;

    if (Object.keys(changes).length === 0) return;
    await updateAccount(changes);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <p className="text-slate-400">Configure your preferences below</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mbs-6">
        <FormInput
          label="Display Name"
          id="settings-display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="John Doe"
          icon={UserIcon}
        />
        <FormInput
          label="Username"
          id="settings-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="johndoe"
          icon={AtSignIcon}
        />
        <SubmitButton className="mbs-2" isLoading={isUpdatingAccount}>
          Save changes
        </SubmitButton>
      </form>

      <div className="space-y-4 mbs-6">
        <Link to="/delete-user" className="text-error">
          Delete Account
        </Link>
      </div>
    </Modal>
  );
}
export default SettingsModal;
