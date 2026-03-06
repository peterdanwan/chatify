// frontend/src/components/LogoutButton.jsx

import ProfileHeaderButton from './ProfileHeaderButton';
import { useAuthStore } from '../store/useAuthStore';
import { LogOutIcon } from 'lucide-react';

function LogoutButton() {
  const { logout } = useAuthStore();

  return (
    <ProfileHeaderButton onClick={logout} dataTip="Logout">
      <LogOutIcon className="size-5" />
    </ProfileHeaderButton>
  );
}
export default LogoutButton;
