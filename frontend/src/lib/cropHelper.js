// frontend/src/lib/cropHelper.js

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
export async function getCroppedImg(imageSrc, pixelCrop) {
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
