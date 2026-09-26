import PlusIcon from '@/assets/photoPlus.svg?react';
import DeleteIcon from '@/assets/delete.svg?react';
import { useRef, useState, useEffect } from 'react';
import {
  createUploadFileName,
  deleteImage,
  getPresignedUrl,
  uploadFileToPresignedUrl,
} from "@/api/image";
import { compressImage } from "@/utils/imageCompression";
import { showToast } from "./ShowToast";

interface PlaceReviewCardProps {
  id: number;
  label: string;
  review: string;
  photo: string | null;
  onChangeReview: (value: string) => void;
  onChangePhoto: (value: string | null) => void;
}

export default function PlaceReviewCard({
  id,
  label,
  review,
  photo,
  onChangeReview,
  onChangePhoto,
}: PlaceReviewCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleChangePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) {
      e.target.value = '';
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const previousPhoto = photo;
      const compressedFile = await compressImage(file);
      const fileName = createUploadFileName(compressedFile);
      const presignedItem = await getPresignedUrl({
        folder: "JOURNAL",
        fileName,
      });

      await uploadFileToPresignedUrl(
        presignedItem.presignedUrl,
        compressedFile,
        presignedItem.contentType,
      );

      onChangePhoto(presignedItem.imageUrl);

      if (previousPhoto) {
        await deleteImage(previousPhoto);
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
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (isUploading) return;
    if (!photo) return;

    try {
      await deleteImage(photo);
      onChangePhoto(null);
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "장소 사진 삭제에 실패했습니다.",
      });
    }
  };

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [review, isEditing]);

  return(
    <div className="flex w-[360px] items-center justify-center rounded-lg bg-white px-3 py-2 gap-3">
      {photo ? (
          <div className="relative w-[72px] h-[72px] shrink-0 overflow-hidden rounded-[12px]"
          >
            <img
              src={photo}
              alt={`${label} 사진`}
              className='w-full h-full object-cover rounded-[12px]'
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => void handleDeletePhoto()}
              className="absolute top-1 right-1"
            >
              <DeleteIcon className="size-4"/>
            </button>
          </div>
      ):(
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex w-[72px] h-[72px] cursor-pointer shrink-0 items-center justify-center rounded-[12px] bg-secondary-10 border border-dashed border-secondary-40"
        >
          <PlusIcon className='size-3'/>
        </button>
      )}

      <div className='flex flex-col w-full min-w-0 items-start gap-2'>
        <p className="text-subtitle font-semibold text-gray-100 leading-[1.4] tracking-[-0.025em]">
          {label}
        </p>
        {isEditing? (
          <textarea
            ref={textareaRef}
            value={review}
            onChange={(e) => onChangeReview(e.target.value)}
            onBlur={()=> setIsEditing(false)}
            autoFocus
            rows={1}
            placeholder='이 장소는 어땠나요?'
            className='w-full resize-none overflow-hidden rounded-[12px] caret-primary-50 border border-gray-40 p-2 text-body-02 leading-[1.4] tracking-[-0.025em] text-gray-90 placeholder:text-gray-50 outline-none' 
          />
        ): (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full rounded-[12px] border border-gray-40 px-2 py-2 text-left"
          >
            <p className="truncate text-body-02 leading-[1.4] tracking-[-0.025em] text-gray-90">
              {review || (
                <span className="text-gray-50">이 장소는 어땠나요?</span>
              )}
            </p>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChangePhoto}
        name={`place-review-photo-${id}`}
      />
    </div>
  )
}
