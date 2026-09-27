import {
  createUploadFileName,
  deleteImage,
  getPresignedUrlsBatch,
  uploadFileToPresignedUrl,
} from "@/api/image";
import { showToast } from "@/pages/course/components/ShowToast";
import { useRef, useState } from "react";
import PlusIcon from "@/assets/photoPlus.svg?react";
import DeleteIcon from "@/assets/delete.svg?react";

interface PlacePhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  kakaoPlaceId: string;
}

export default function PlacePhotoUploader({
  photos,
  onChange,
  kakaoPlaceId,
}: PlacePhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) {
      e.target.value = "";
      return;
    }

    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const fileNames = files.map((file) => createUploadFileName(file));
      const presignedItems = await getPresignedUrlsBatch({
        folder: "STATIC_PLACE",
        kakaoPlaceId,
        fileNames,
      });

      await Promise.all(
        presignedItems.map((item, index) =>
          uploadFileToPresignedUrl(
            item.presignedUrl,
            files[index],
            item.contentType,
          ),
        ),
      );

      const nextPhotos = presignedItems.map((item) => item.imageUrl);
      onChange([...photos, ...nextPhotos]);
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "사진 업로드에 실패했습니다.",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDeletePhoto = async (targetIndex: number) => {
    if (isUploading) return;

    const targetPhoto = photos[targetIndex];
    if (!targetPhoto) return;

    try {
      await deleteImage(targetPhoto);
      onChange(photos.filter((_, index) => index !== targetIndex));
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "사진 삭제에 실패했습니다.",
      });
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={isUploading}
        onClick={() => {
          if (!kakaoPlaceId) {
            showToast({ message: "장소를 먼저 선택해주세요." });
            return;
          }
          inputRef.current?.click();
        }}
        className="flex w-[108px] h-[108px] items-center justify-center rounded-lg bg-secondary-10 border border-dashed border-secondary-40 outline-none"
      >
        <PlusIcon className="size-3" />
      </button>

      {photos.map((photo, index) => (
        <div
          key={`${photo}-${index}`}
          className="relative h-[108px] w-[108px] overflow-hidden rounded-lg"
        >
          <img
            src={photo}
            alt={`upload-${index + 1}`}
            className="h-full w-full object-cover"
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => void handleDeletePhoto(index)}
            className="absolute top-[10px] right-2"
          >
            <DeleteIcon className="size-5" />
          </button>
        </div>
      ))}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAddPhoto}
      />
    </>
  );
}
