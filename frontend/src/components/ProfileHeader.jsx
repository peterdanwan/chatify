// frontend/src/components/ProfileHeader.jsx

import { useRef, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
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

// ---------------------------------------------------------------------------
// Crop helper
// ---------------------------------------------------------------------------
// OUTPUT_SIZE is the pixel dimensions of the final square image we send to the
// server. 400px is a good balance — sharp on retina screens, not bloated.
const OUTPUT_SIZE = 400;

/**
 * Given a source image URL and the pixel-perfect crop region returned by
 * react-easy-crop, this draws the cropped area onto a canvas and returns a
 * base64 JPEG string that is exactly OUTPUT_SIZE × OUTPUT_SIZE pixels.
 *
 * We multiply by devicePixelRatio so that on retina (2×, 3×) displays the
 * canvas backing store has enough pixels to look sharp instead of blurry.
 */
async function getCroppedImg(imageSrc, pixelCrop) {
  // 1. Load the original image into memory so we can draw from it.
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  // 2. Account for high-DPI / retina screens.
  //    A 2× retina screen has devicePixelRatio = 2, meaning we need a canvas
  //    that is 800×800 backing pixels to render a crisp 400×400 CSS pixel image.
  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE * dpr;
  canvas.height = OUTPUT_SIZE * dpr;

  const ctx = canvas.getContext('2d');

  // Scale the context so our drawing commands use CSS pixels, but the canvas
  // backing store is dpr× larger — this is what prevents graininess.
  ctx.scale(dpr, dpr);

  // 3. Draw only the cropped region of the source image, stretched to fill the
  //    full OUTPUT_SIZE × OUTPUT_SIZE output square.
  ctx.drawImage(
    image,
    pixelCrop.x, // source x
    pixelCrop.y, // source y
    pixelCrop.width, // source width  (the crop window on the original image)
    pixelCrop.height, // source height
    0, // destination x
    0, // destination y
    OUTPUT_SIZE, // destination width
    OUTPUT_SIZE // destination height
  );

  // 4. Export as a high-quality JPEG base64 string.
  //    0.92 quality is visually lossless for profile pictures and keeps file
  //    size reasonable. Use 'image/webp' if you want even better compression.
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      },
      'image/jpeg',
      0.92
    );
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function ProfileHeader() {
  const { logout, authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Crop state ---
  // rawImageSrc holds the full-resolution data URL we hand to the Cropper.
  // We keep it separate from selectedImage so the displayed avatar always
  // shows the final cropped result, not the raw upload.
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // react-easy-crop needs these two pieces of state to track the pan/zoom.
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // onCropComplete gives us the *pixel* coordinates of the crop area on the
  // original image — this is what we pass to getCroppedImg.
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef(null);

  // Called by react-easy-crop every time the user moves/zooms the crop box.
  const handleCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Step 1: User picks a file → read it into memory and open the crop modal.
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    // Reset the input value so re-uploading the same file still fires onChange.
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setRawImageSrc(reader.result); // full-res image for the cropper
      setCrop({ x: 0, y: 0 }); // reset crop position
      setZoom(1); // reset zoom
      setIsCropModalOpen(true);
    };
  };

  // Step 2: User confirms the crop → extract pixels, upload, close modal.
  const handleCropConfirm = async () => {
    try {
      const croppedBase64 = await getCroppedImg(rawImageSrc, croppedAreaPixels);
      setSelectedImage(croppedBase64); // update avatar preview immediately
      await updateProfile({ profilePic: croppedBase64 });
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setIsCropModalOpen(false);
      setRawImageSrc(null);
    }
  };

  const handleCropCancel = () => {
    setIsCropModalOpen(false);
    setRawImageSrc(null);
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

      {/* ----------------------------------------------------------------- */}
      {/* CROP MODAL                                                         */}
      {/* ----------------------------------------------------------------- */}
      {/* We render this inline rather than using your existing <Modal> so   */}
      {/* we can give the Cropper a fixed-height container — react-easy-crop */}
      {/* requires its parent to have a non-zero, explicit height.           */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-slate-100 font-semibold">Crop Profile Picture</h2>
              <p className="text-slate-400 text-xs mt-1">
                Drag to reposition · Scroll or pinch to zoom
              </p>
            </div>

            {/*
              This div MUST have an explicit height. react-easy-crop positions
              itself absolutely within this container, so if the container has
              no height the cropper collapses to zero and is invisible.
            */}
            <div className="relative w-full aspect-square bg-slate-900">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // 1:1 = square avatar (match your <img> shape)
                cropShape="round" // shows a circular guide; remove for square
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            {/* Zoom slider — gives users without a scroll wheel a way to zoom */}
            <div className="px-4 pt-4 pb-2">
              <label className="text-slate-400 text-xs mb-1 block">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-grab active:cursor-grabbing"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-4">
              <button
                onClick={handleCropCancel}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-100 hover:bg-white text-indigo-900 hover:text-indigo-600 transition-colors hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                disabled={isUpdatingProfile}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 flex items-center gap-2 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {isUpdatingProfile && <Loader2 className="size-4 animate-spin" />}
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      <Modal isOpen={isSettingsOpen} onClose={handleCloseModal} title="Settings">
        <p className="text-slate-400">Configure your preferences below</p>
        {/* TODO: Add settings content here */}
        <div className="space-y-4 mt-6">
          {/* e.g., Option to delete user. Change status. etc. */}
        </div>
      </Modal>
    </div>
  );
}

export default ProfileHeader;
