import { useEffect, useState } from "react";
import {
  likeExploreCourse,
  unlikeExploreCourse,
  type ExploreCourse,
} from "@/api/explore";
import Heart from "@/assets/heart.svg?react";
import CardBG from "@/assets/card-default.svg?react";
import HeartFilled from "@/assets/explore/heart-filled.svg?react";
import LineBadge, { type SubwayLine } from "@/components/LineBadge";
import CourseRankBadge from "./CourseRankBadge";
import LeadToLoginModal from "@/components/LeadToLoginModal";
import { getAccessToken, subscribeToAccessTokenChange } from "@/api/auth";

interface ExploreCourseCardProps {
  course: ExploreCourse;
  onClick?: () => void;
  rank: number;
}

const CARD_GRADIENT =
  "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.75) 100%)";

function getSubwayLine(code: string): SubwayLine | null {
  const matchedLine = /^LINE_([1-9])$/.exec(code);
  return matchedLine ? (Number(matchedLine[1]) as SubwayLine) : null;
}

export default function ExploreCourseCard({
  course,
  onClick,
  rank,
}: ExploreCourseCardProps) {
  const [liked, setLiked] = useState(course.isLiked);
  const [originalLiked, setOriginalLiked] = useState(course.isLiked);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const likeCount =
    course.likeCount + (liked === originalLiked ? 0 : liked ? 1 : -1);
  const hasBackgroundImage = Boolean(course.imageUrl);
  const backgroundImage = hasBackgroundImage
    ? `${CARD_GRADIENT}, url(${course.imageUrl})`
    : undefined;
  const textColorClass = hasBackgroundImage ? "text-white" : "text-gray-100";
  const subwayLine = course.line ? getSubwayLine(course.line.code) : null;

  useEffect(() => {
    return subscribeToAccessTokenChange((token) => {
      if (!token) {
        setLiked(false);
        setOriginalLiked(false);
      }
    });
  }, []);

  const handleLike = async () => {
    if (isLikePending) return;
    if (!getAccessToken()) {
      setIsLoginModalOpen(true);
      return;
    }

    const nextLiked = !liked;
    setLiked(nextLiked);
    setIsLikePending(true);
    try {
      if (nextLiked) {
        await likeExploreCourse(course.courseId);
      } else {
        await unlikeExploreCourse(course.courseId);
      }
    } catch {
      setLiked(liked);
    } finally {
      setIsLikePending(false);
    }
  };

  return (
    <>
      <article
      className="relative flex h-[200px] w-36 shrink-0 flex-col justify-between overflow-hidden rounded-lg bg-secondary-20 pb-4 pl-4 pr-2 pt-4 shadow-[0_0_20px_rgb(118_118_118/20%)]"
      style={
        backgroundImage
          ? {
              backgroundImage,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "link" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {!hasBackgroundImage && (
        <CardBG className="absolute inset-0 h-full w-full" aria-hidden="true" />
      )}
      <CourseRankBadge className="relative z-10 self-end" rank={rank} />
      <div className="relative z-10 flex w-[112px] flex-col gap-[9px]">
        <div
          className={`inline-flex items-center gap-1 whitespace-nowrap text-body-02 ${textColorClass}`}
        >
          {subwayLine && <LineBadge line={subwayLine} />}
          {course.stationName}
        </div>
        <p
          className={`line-clamp-2 break-keep break-words text-subtitle font-semibold leading-[1.4] tracking-[-0.025em] ${textColorClass}`}
        >
          {course.name}
        </p>
        <button
          type="button"
          className={`inline-flex items-center gap-0.5 self-start border-0 bg-transparent p-0 text-caption ${textColorClass}`}
          aria-label={liked ? "좋아요 완료" : "좋아요"}
          aria-pressed={liked}
          disabled={isLikePending}
          onClick={(event) => {
            event.stopPropagation();
            void handleLike();
          }}
        >
          {liked ? (
            <HeartFilled
              className={`size-3 ${textColorClass} [&_path]:fill-current`}
              aria-hidden="true"
            />
          ) : (
            <Heart
              className={`size-3 ${textColorClass} [&_path]:stroke-current`}
              aria-hidden="true"
            />
          )}
          {likeCount}
        </button>
      </div>
      </article>
      {isLoginModalOpen && (
        <LeadToLoginModal
          message={"좋아요를 누르려면\n로그인이 필요해요!"}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </>
  );
}
