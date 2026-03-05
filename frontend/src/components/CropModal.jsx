// frontend/src/components/CropModal.jsx

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Loader2 } from 'lucide-react';

import { getCroppedImg } from '../lib/cropHelper';

/**
 * A self-contained crop modal.
 *
 * Props:
 *   imageSrc        {string}    – Full-resolution data URL of the image to crop.
 *   isUpdating      {boolean}   – When true, disables the Apply button and shows a spinner.
 *   onConfirm       {Function}  – Called with the cropped base64 JPEG string on confirmation.
 *   onCancel        {Function}  – Called when the user dismisses without confirming.
 *
 * We render this inline rather than using your existing <Modal> so
 * we can give the Cropper a fixed-height container — react-easy-crop
 * requires its parent to have a non-zero, explicit height.
 */

function CropModal({ imageSrc, isUpdating, onConfirm, onCancel }) {
  // react-easy-crop needs these two pieces of state to track the pan/zoom.
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // onCropComplete gives us the *pixel* coordinates of the crop area on the
  // original image — this is what we pass to getCroppedImg.
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Called by react-easy-crop every time the user moves/zooms the crop box.
  const handleCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    try {
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(croppedBase64);
    } catch (err) {
      console.error('Crop failed:', err);
    }
  };

  return (
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
            image={imageSrc}
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
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-100 hover:bg-white text-indigo-900 hover:text-indigo-600 transition-colors hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isUpdating}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 flex items-center gap-2 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {isUpdating && <Loader2 className="size-4 animate-spin" />}
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default CropModal;
