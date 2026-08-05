// Downscale an uploaded image to a small dataURL so localStorage stays small.
// Shared by the expense-receipt picker and the business-logo picker.
//
// PNG inputs are re-encoded as PNG (preserves transparency — critical for a
// logo with a see-through background). Everything else falls back to JPEG at
// the given quality, which keeps camera photos of receipts small.
export function imageToThumb(file, max = 900, quality = 0.7) {
  const isPng = file && file.type === 'image/png';
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > max || height > max) {
          const r = Math.min(max / width, max / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(null);
      img.src = reader.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
