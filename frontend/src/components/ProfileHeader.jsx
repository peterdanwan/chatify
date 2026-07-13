// frontend/src/components/ProfileHeader.jsx

import { useState } from 'react';

import { useAuthStore } from '../store/useAuthStore';
import AvatarUpload from './AvatarUpload';
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

  // Step 1: User picks a file → read it into a data URL and open the crop modal.
  const handleFileSelect = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setRawImageSrc(reader.result);
  };

  // Step 2: User confirms the crop → update the avatar preview and upload.
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
          <AvatarUpload
            imageSrc={selectedImage || authUser.profilePic}
            isUpdating={isUpdatingProfile}
            onFileSelect={handleFileSelect}
          />
          <div>
            <h3 className="text-slate-200 font-medium text-sm small:text-base truncate tooltip tooltip-right max-w-45">
              {authUser.displayName}
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
