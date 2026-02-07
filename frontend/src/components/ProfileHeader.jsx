// frontend/src/components/ProfileHeader.jsx

import { useRef, useState } from 'react';
import { CircleUserRound, Loader2, LogOutIcon, Volume2Icon, VolumeOffIcon } from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

const mouseClickSound = new Audio('/sounds/mouse-click.mp3');

function ProfileHeader() {
  const { logout, authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImage, setSelectedImage] = useState(null);
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

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
            <h3 className="text-slate-200 font-medium text-base max-w-45 truncate">
              {`${authUser.firstName} ${authUser.lastName}`}
            </h3>

            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 items-center">
          {/* LOGOUT BUTTON */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            onClick={logout}
          >
            <LogOutIcon className="size-5" />
          </button>

          {/* SOUND TOGGLE BUTTON */}
          <button
            className="text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
            onClick={handleToggleButtonClick}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;
