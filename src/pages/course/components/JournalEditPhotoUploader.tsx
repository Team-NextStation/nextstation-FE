import { useRef, useState } from "react";
import PlusIcon from "@/assets/photoPlus.svg?react";
import DeleteIcon from "@/assets/delete.svg?react";
import {
  createUploadFileName,
  deleteImage,
  getPresignedUrlsBatch,
  uploadFileToPresignedUrl,
} from "@/api/image";
import { compressImage } from "@/utils/imageCompression";
import { showToast } from "./ShowToast";
import type { EditPhoto } from "./JournalEditForm";

const MAX_PHOTO_COUNT = 3;

interface JournalEditPhotoUploaderProps {
  photos: EditPhoto[];
  onChange: (photos: EditPhoto[]) => void;
}

export default function JournalEditPhotoUploader({
  photos,
  onChange,
}: JournalEditPhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) {
      event.target.value = "";
      return;
    }

    const files = Array.from(event.target.files ?? []);
    const file = files[0];
    if (!file || photos.length >= MAX_PHOTO_COUNT) {
      event.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const compressedFile = await compressImage(file);
      const [presignedItem] = await getPresignedUrlsBatch({
        folder: "JOURNAL",
        fileNames: [createUploadFileName(compressedFile)],
      });

      await uploadFileToPresignedUrl(
        presignedItem.presignedUrl,
        compressedFile,
        presignedItem.contentType,
      );

      onChange([...photos, { imageUrl: presignedItem.imageUrl }]);
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "대표 사진 업로드에 실패했습니다.",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDeletePhoto = async (targetIndex: number) => {
    if (isUploading) return;

    const targetPhoto = photos[targetIndex];
    if (!targetPhoto) return;

    try {
      await deleteImage(targetPhoto.imageUrl);
      onChange(photos.filter((_, index) => index !== targetIndex));
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "대표 사진 삭제에 실패했습니다.",
      });
    }
  };

  return (
    <>
      <div className="flex w-full items-center gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {photos.map((photo, index) => (
          <div
            key={`${photo.imageUrl}-${index}`}
            className="relative h-[260px] w-[260px] shrink-0 overflow-hidden rounded-lg"
          >
            <img
              src={photo.imageUrl}
              alt={`upload-${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => void handleDeletePhoto(index)}
              className="absolute right-2 top-2"
            >
              <DeleteIcon className="size-[30px]" />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTO_COUNT ? (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-[260px] w-[260px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed border-secondary-40 bg-secondary-10 outline-none"
          >
            <PlusIcon className="size-[30px]" />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAddPhoto}
      />
    </>
  );
}
