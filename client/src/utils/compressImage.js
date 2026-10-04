const MAX_WIDTH = 800;
const JPEG_QUALITY = 0.7;

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load the image"));
      img.onload = () => resolve(drawToCompressedDataUrl(img));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function drawToCompressedDataUrl(img) {
  const scale = Math.min(1, MAX_WIDTH / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
