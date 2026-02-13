// frontend/src/components/ProfileHeader.jsx

import { useRef, useState } from 'react';
import {
  CircleUserRound,
  Loader2,
  LogOutIcon,
  SettingsIcon,
  Volume2Icon,
  VolumeOffIcon,
} from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import ProfileHeaderButton from './ProfileHeaderButton';
import Modal from './Modal';

const mouseClickSound = new Audio('/sounds/mouse-click.mp3');

function ProfileHeader() {
  const { logout, authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Ref: https://react.dev/reference/react/useRef
  const fileInputRef = useRef(null);

  // PW: common way of uploading images
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      // String version of our image
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleToggleButtonClick = () => {
    // Only play sound if we're turning sound on
    if (!isSoundEnabled) {
      mouseClickSound.currentTime = 0; // reset to start
      mouseClickSound.play().catch((error) => {
        console.log('Audio play failed:', error);
      });
    }

    toggleSound();
  };

  const handleSettingsButtonClick = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseModal = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div id="profile-header" className="p-6 border-b border-slate-700/50">
      <div className="flex justify-between gap-6">
        <div id="auth-user-info-container" className="flex items-center gap-3">
          {/* AVATAR | Ref: https://daisyui.com/components/avatar/#avatar-with-presence-indicator */}
          <div className="avatar avatar-online">
            <button
              className="size-14 rounded-full overflow-hidden relative group"
              onClick={() => {
                fileInputRef.current.click();
              }}
              disabled={isUpdatingProfile}
            >
              {selectedImage || authUser.profilePic ? (
                <img
                  src={selectedImage || authUser.profilePic}
                  alt="User image"
                  className="size-full object-cover"
                />
              ) : (
                // Ref: https://lucide.dev/icons/circle-user-round
                <CircleUserRound strokeWidth={1.2} className="size-full" />
              )}
              {isUpdatingProfile && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 className="size-6 text-white animate-spin" />
                </div>
              )}

              {!isUpdatingProfile && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <span className="text-white text-xs">Change</span>
                </div>
              )}
            </button>
            {/* Accepts the MIME type of image/*, e.g., image/jpeg, image/png, image/gif, etc.  */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-slate-200 font-medium text-sm small:text-base truncate tooltip tooltip-right max-w-45 ">
              {`${authUser.firstName} ${authUser.lastName}`}
            </h3>

            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div id="settings-container" className="flex gap-4 items-center mb-3">
          {/* LOGOUT BUTTON */}
          <ProfileHeaderButton onClick={logout} dataTip="Logout">
            <LogOutIcon className="size-5" />
          </ProfileHeaderButton>

          {/* SOUND TOGGLE BUTTON */}
          <ProfileHeaderButton
            onClick={handleToggleButtonClick}
            dataTip={isSoundEnabled ? 'Toggle Sound Off' : 'Toggle Sound On'}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </ProfileHeaderButton>

          {/* SETTINGS BUTTON */}
          <ProfileHeaderButton onClick={handleSettingsButtonClick} dataTip="Settings">
            <SettingsIcon className="size-5" />
          </ProfileHeaderButton>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={handleCloseModal} title="Settings">
        <p className="text-slate-400">Configure your preferences below</p>

        {/* TODO: Add settings content here */}
        <div className="space-y-4 mt-6">
          {/* e.g., Option to delete user. Change status. etc.*/}
        </div>
      </Modal>
    </div>
  );
}
export default ProfileHeader;
