// frontend/src/components/AvatarUpload.jsx

import { useRef } from 'react';
import { CircleUserRound, Loader2 } from 'lucide-react';

/**
 * A clickable avatar that opens a file picker when clicked.
 *
 * Props:
 *   imageSrc     {string|null}  – URL or base64 of the current avatar. If
 *                                 falsy, a generic user icon is shown instead.
 *   isUpdating   {boolean}      – When true, disables the button and shows a
 *                                 centered loading spinner over the avatar.
 *   onFileSelect {Function}     – Called with the raw File object once the user
 *                                 picks one. The parent is responsible for
 *                                 reading it (e.g. into a data URL).
 */
function AvatarUpload({ imageSrc, isUpdating, onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    // Reset so re-selecting the same file still fires onChange next time.
    event.target.value = '';
    if (file) onFileSelect(file);
  };

  return (
    // Ref: https://daisyui.com/components/avatar/#avatar-with-presence-indicator
    <div className="avatar avatar-online">
      <button
        className="size-14 rounded-full overflow-hidden relative group"
        onClick={() => fileInputRef.current.click()}
        disabled={isUpdating}
      >
        {/* ── Image or fallback icon ── */}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="User avatar"
            className="size-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          // Ref: https://lucide.dev/icons/circle-user-round
          <CircleUserRound strokeWidth={1.2} className="size-full" />
        )}

        {/* ── Loading overlay (upload in progress) ── */}
        {isUpdating && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Loader2 className="size-6 text-white animate-spin" />
          </div>
        )}

        {/* ── Hover overlay (invite the user to click) ── */}
        {!isUpdating && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            <span className="text-white text-xs">Change</span>
          </div>
        )}
      </button>

      {/* Accepts any image MIME type: image/jpeg, image/png, image/gif, etc. */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default AvatarUpload;
