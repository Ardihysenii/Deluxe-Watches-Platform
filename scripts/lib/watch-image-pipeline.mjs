/**
 * Normalize watch photos for Alfa Accessories catalog:
 * - remove light/white backgrounds
 * - crop to watch bounds
 * - center on a consistent transparent canvas (platform posture)
 */
import sharp from 'sharp';

export const CANVAS_SIZE = 900;
export const WATCH_FILL_RATIO = 0.78;

const WHITE_THRESHOLD = 238;
const FEATHER_START = 210;

export function alphaForPixel(r, g, b) {
  const avg = (r + g + b) / 3;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);

  if (avg >= WHITE_THRESHOLD && spread <= 28) {
    return 0;
  }

  if (avg >= FEATHER_START && spread <= 40) {
    const t = (avg - FEATHER_START) / (WHITE_THRESHOLD - FEATHER_START);
    return Math.round(255 * (1 - Math.min(1, Math.max(0, t))));
  }

  return 255;
}

export async function removeLightBackground(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = alphaForPixel(data[i], data[i + 1], data[i + 2]);
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  }).png();
}

function findOpaqueBounds(data, width, height) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 12) {
        found = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!found) {
    return { left: 0, top: 0, width, height };
  }

  const pad = Math.round(Math.max(width, height) * 0.02);
  return {
    left: Math.max(0, minX - pad),
    top: Math.max(0, minY - pad),
    width: Math.min(width - minX, maxX - minX + 1 + pad * 2),
    height: Math.min(height - minY, maxY - minY + 1 + pad * 2),
  };
}

export async function normalizeWatchImage(inputBuffer) {
  const cutout = await removeLightBackground(inputBuffer);
  const { data, info } = await cutout.raw().toBuffer({ resolveWithObject: true });
  const bounds = findOpaqueBounds(data, info.width, info.height);

  const cropped = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .extract(bounds)
    .png()
    .toBuffer();

  const target = Math.round(CANVAS_SIZE * WATCH_FILL_RATIO);
  const resized = await sharp(cropped)
    .resize({
      width: target,
      height: target,
      fit: 'inside',
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const left = Math.round((CANVAS_SIZE - meta.width) / 2);
  const top = Math.round((CANVAS_SIZE - meta.height) / 2);

  return sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, left, top }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}
