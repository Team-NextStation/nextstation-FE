import { useRef, useState } from "react";
import PlusIcon from "@/assets/photoPlus.svg?react";
import DeleteIcon from "@/assets/delete.svg?react";
import {
  createUploadFileName,
  deleteImage,
  getPresignedUrl,
  uploadFileToPresignedUrl,
} from "@/api/image";
import { showToast } from "./ShowToast";

interface JournalEditPlaceItemProps {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  onChangeDescription: (value: string) => void;
  onChangeImage: (value: string | null) => void;
}

export default function JournalEditPlaceItem({
  id,
  name,
  description,
  imageUrl,
  onChangeDescription,
  onChangeImage,
}: JournalEditPlaceItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isUploading) {
      event.target.value = "";
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const previousImage = imageUrl;
      const presignedItem = await getPresignedUrl({
        folder: "JOURNAL",
        fileName: createUploadFileName(file),
      });

      await uploadFileToPresignedUrl(
        presignedItem.presignedUrl,
        file,
        presignedItem.contentType,
      );

      onChangeImage(presignedItem.imageUrl);

      if (previousImage) {
        await deleteImage(previousImage);
      }
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "장소 사진 업로드에 실패했습니다.",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleImageDelete = async () => {
    if (isUploading || !imageUrl) return;

    try {
      await deleteImage(imageUrl);
      onChangeImage(null);
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "장소 사진 삭제에 실패했습니다.",
      });
    }
  };

  return (
    <div className="flex w-full h-25 items-start gap-6">
      {imageUrl ? (
        <div className="relative size-25 shrink-0 overflow-hidden bg-secondary-10">
          <img
            src={imageUrl}
            alt={`${name} 사진`}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => void handleImageDelete()}
            className="absolute right-1.5 top-1.5"
          >
            <DeleteIcon className="size-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex size-25 shrink-0 items-center justify-center bg-primary-20"
        >
          <PlusIcon className="size-6" />
        </button>
      )}

      <div className="flex h-full min-w-0 flex-1 flex-col items-start">
        <p className="shrink-0 text-subtitle font-semibold leading-[1.4] tracking-[-0.025em] text-gray-100">
          {name}
        </p>
        <textarea
          value={description}
          onChange={(event) => onChangeDescription(event.target.value)}
          rows={3}
          placeholder="이 장소는 어땠나요?"
          className="mt-2 min-h-0 flex-1 w-full resize-none overflow-y-auto rounded-md border border-gray-40 bg-white p-2 text-subtitle leading-[1.4] tracking-[-0.025em] text-gray-80 caret-primary-50 outline-none placeholder:text-gray-50"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
        name={`journal-edit-place-image-${id}`}
      />
    </div>
  );
}
