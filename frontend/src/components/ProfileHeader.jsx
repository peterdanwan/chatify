// frontend/src/components/ProfileHeader.jsx

import { useRef, useState } from 'react';
import { CircleUserRound, Loader2 } from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';
import CropModal from './CropModal';
import SettingsModal from './SettingsModal';
import SoundToggleButton from './SoundToggleButton';
import LogoutButton from './LogoutButton';
import SettingsButton from './SettingsButton';

function ProfileHeader() {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // rawImageSrc holds the full-resolution data URL we hand to <CropModal>.
  // We keep it separate from selectedImage so the displayed avatar always
  // shows the final cropped result, not the raw upload.
  const [rawImageSrc, setRawImageSrc] = useState(null);

  const fileInputRef = useRef(null);

  // Step 1: User picks a file → read it into memory and open the crop modal.
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    // Reset the input value so re-uploading the same file still fires onChange.
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setRawImageSrc(reader.result);
    };
  };

  // Step 2: User confirms the crop → update avatar preview and upload.
  const handleCropConfirm = async (croppedBase64) => {
    try {
      setSelectedImage(croppedBase64);
      await updateProfile({ profilePic: croppedBase64 });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setRawImageSrc(null);
    }
  };

  const handleCropCancel = () => {
    setRawImageSrc(null);
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
          <LogoutButton />
          <SoundToggleButton />
          <SettingsButton onClick={() => setIsSettingsOpen(true)} />
        </div>
      </div>

      {rawImageSrc && (
        <CropModal
          imageSrc={rawImageSrc}
          isUpdating={isUpdatingProfile}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default ProfileHeader;
