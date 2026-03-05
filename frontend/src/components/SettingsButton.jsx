// frontend/src/components/SettingsButton.jsx
import ProfileHeaderButton from './ProfileHeaderButton';
import { SettingsIcon } from 'lucide-react';

function SettingsButton({ onClick }) {
  return (
    <ProfileHeaderButton onClick={onClick} dataTip="Settings">
      <SettingsIcon className="size-5" />
    </ProfileHeaderButton>
  );
}
export default SettingsButton;
