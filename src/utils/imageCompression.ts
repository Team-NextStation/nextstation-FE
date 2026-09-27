const DEFAULT_MAX_DIMENSION = 2000;
const DEFAULT_QUALITY = 0.82;

export function getResizedImageDimensions(
  width: number,
  height: number,
  maxDimension: number,
) {
  const longestSide = Math.max(width, height);

  if (longestSide <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / longestSide;

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 읽을 수 없습니다."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("이미지 변환에 실패했습니다."));
      }
    }, type, quality);
  });
}

export async function compressImage(
  file: File,
  options?: { maxDimension?: number; quality?: number },
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = options?.quality ?? DEFAULT_QUALITY;
  const image = await loadImage(file);
  const dimensions = getResizedImageDimensions(
    image.naturalWidth,
    image.naturalHeight,
    maxDimension,
  );
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const context = canvas.getContext("2d");
  if (!context) return file;

  context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
  const blob = await canvasToBlob(canvas, "image/jpeg", quality);

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}
