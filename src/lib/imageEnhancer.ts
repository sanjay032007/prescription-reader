/**
 * Client-side document image enhancement for faint, messy, or dark handwriting.
 * Boosts contrast, sharpens ink strokes, and removes lighting shadows on an HTML5 Canvas.
 */
export async function enhancePrescriptionImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const maxDim = 2048;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          // Draw original image scaled
          ctx.drawImage(img, 0, 0, width, height);

          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;

          // 1. Calculate average luminance for adaptive contrast stretch
          let minLum = 255;
          let maxLum = 0;
          for (let i = 0; i < data.length; i += 16) {
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            if (lum < minLum) minLum = lum;
            if (lum > maxLum) maxLum = lum;
          }

          const range = Math.max(1, maxLum - minLum);

          // 2. High-contrast document enhancement & shadow reduction
          for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Normalize and stretch contrast
            r = ((r - minLum) / range) * 255;
            g = ((g - minLum) / range) * 255;
            b = ((b - minLum) / range) * 255;

            // S-curve contrast boost for ink separation from paper
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum > 180) {
              // Whitewash paper background shadows
              r = Math.min(255, r * 1.15 + 10);
              g = Math.min(255, g * 1.15 + 10);
              b = Math.min(255, b * 1.15 + 10);
            } else if (lum < 110) {
              // Darken ink handwriting strokes
              r = Math.max(0, r * 0.75);
              g = Math.max(0, g * 0.75);
              b = Math.max(0, b * 0.75);
            }

            data[i] = Math.min(255, Math.max(0, r));
            data[i + 1] = Math.min(255, Math.max(0, g));
            data[i + 2] = Math.min(255, Math.max(0, b));
          }

          ctx.putImageData(imgData, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const enhancedFile = new File(
                  [blob],
                  `enhanced_${file.name.replace(/\.[^/.]+$/, "")}.jpg`,
                  { type: "image/jpeg" }
                );
                resolve(enhancedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.92
          );
        } catch {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
