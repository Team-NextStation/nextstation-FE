import { useRef } from "react";
import { useState } from "react";
import PlusIcon from '@/assets/photoPlus.svg?react';
import DeleteIcon from '@/assets/delete.svg?react';
import {
  createUploadFileName,
  deleteImage,
  getPresignedUrlsBatch,
  uploadFileToPresignedUrl,
} from "@/api/image";
import { compressImage } from "@/utils/imageCompression";
import { showToast } from "./ShowToast";

const MAX_PHOTO_COUNT = 3;

interface LogPhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export default function LogPhotoUploader({
  photos,
  onChange,
}: LogPhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) {
      e.target.value = "";
      return;
    }

    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remainingCount = MAX_PHOTO_COUNT - photos.length;
    if (remainingCount <= 0) {
      e.target.value = "";
      return;
    }

    const uploadTargets = files.slice(0, remainingCount);

    setIsUploading(true);

    try {
      const compressedFiles = await Promise.all(
        uploadTargets.map((file) => compressImage(file)),
      );
      const fileNames = compressedFiles.map((file) => createUploadFileName(file));
      const presignedItems = await getPresignedUrlsBatch({
        folder: "JOURNAL",
        fileNames,
      });

      await Promise.all(
        presignedItems.map((item, index) =>
          uploadFileToPresignedUrl(
            item.presignedUrl,
            compressedFiles[index],
            item.contentType,
          ),
        ),
      );

      const nextPhotos = presignedItems.map((item) => item.imageUrl);
      onChange([...photos, ...nextPhotos].slice(0, MAX_PHOTO_COUNT));
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "대표 사진 업로드에 실패했습니다.",
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
          error instanceof Error
            ? error.message
            : "대표 사진 삭제에 실패했습니다.",
      });
    }
  };

  return (
    <>
      <div className="flex w-full items-center gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {photos.length < MAX_PHOTO_COUNT ? (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="flex w-[108px] h-[108px] cursor-pointer items-center justify-center rounded-lg bg-secondary-10 border border-dashed border-secondary-40 outline-none"
          >
            <PlusIcon className="size-3"/>
          </button>
        ) : null}

        {photos.map((photo, index) => (
          <div
            key={`${photo}-${index}`}
            className="relative h-[108px] w-[108px] shrink-0 overflow-hidden rounded-lg"
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
              <DeleteIcon className="size-5"/>
            </button>

          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAddPhoto}
      />
    </>
  )
}
