import ProfileDefault from "@/assets/profile-default.svg?react";
import LikeDefault from "@/assets/like-default.svg?react";
import LikeActive from "@/assets/like-active.svg?react";
import MoreIcon from "@/assets/like/more.svg?react";
import { useRef, useState } from "react";

export default function ReviewCard({
  writerNickname,
  writerProfileImageUrl,
  content,
  imageUrl,
  likeCount,
  isLiked,
  onToggleLike,
  createdAt,
  isMine,
  onReport,
}: {
  writerNickname: string;
  writerProfileImageUrl: string;
  content: string;
  imageUrl: string | null;
  likeCount: number;
  isLiked: boolean;
  onToggleLike: () => Promise<void>;
  createdAt: string;
  isMine: boolean;
  onReport: () => void;
}) {
  const [now] = useState(() => Date.now());
  const diffDays = Math.floor(
    (now - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  const isImageEmpty = imageUrl === null;
  const isRequestingRef = useRef(false); // 좋아요 요청 중인지 확인
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    if (isRequestingRef.current) return;
    isRequestingRef.current = true;
    setIsPending(true);

    try {
      await onToggleLike();
    } finally {
      isRequestingRef.current = false;
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col w-[360px] p-4 gap-4 rounded-lg bg-white items-center">
      {/* user info */}
      <section className="flex items-center w-full justify-between">
        <div className="flex gap-3 items-center">
          {/* 프로필 사진 */}
          {writerProfileImageUrl === null ? (
            <ProfileDefault />
          ) : (
            <div className="flex w-11 h-11 shrink-0 rounded-full border border-primary-20 overflow-hidden">
              <img
                src={writerProfileImageUrl}
                className="w-full h-full object-cover"
                alt={`${writerNickname} 프로필 사진`}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="flex text-body-01 font-semibold leading-[1.4] tracking-[-0.35px]">
              {writerNickname}
            </span>
            <span className="flex text-caption text-gray-70 leading-none tracking-[-0.25px]">
              {diffDays === 0 ? "오늘" : `${diffDays}일 전`}
            </span>
          </div>
        </div>
        {!isMine && (
          <button onClick={onReport}>
            <MoreIcon className="size-6" />
          </button>
        )}
      </section>

      {/* place info */}
      <section className="flex w-full">
        <div className="flex flex-col gap-4">
          <p className="flex text-body-01 text-gray-70 leading-[1.4] tracking-[-0.35px] break-keep">
            {content}
          </p>
          {/* image */}
          {!isImageEmpty && (
            <div className="flex w-[150px] h-[112px] rounded-md overflow-hidden">
              <img src={imageUrl} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* like */}
      <section className="flex gap-1 items-center w-full">
        <button
          type="button"
          onClick={handleClick}
          aria-label={isLiked ? "좋아요 취소" : "좋아요"}
          aria-pressed={isLiked}
          className="items-center justify-center w-4 h-4"
          disabled={isPending}
        >
          {isLiked ? <LikeActive /> : <LikeDefault />}
        </button>
        <span className="text-body-01 text-gray-60 leading-[1.4] tracking-[-0.35px]">
          {likeCount}
        </span>
      </section>
    </div>
  );
}
