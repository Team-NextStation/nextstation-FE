import Header from "@/components/Header";
import BaseLoading from "@/components/BaseLoading";
import ReviewCard from "./components/ReviewCard";
import { useEffect, useState } from "react";
import Empty from "@/assets/empty.svg?react";
import Dropdown from "./components/Dropdown";
import { useParams } from "react-router-dom";
import {
  createReviewLike,
  deleteReviewLike,
  getReviews,
  type Review,
} from "@/api/placeReview";
import { useInView } from "react-intersection-observer";
import ReportModal from "@/components/ReportModal";
import { getCachedMyProfile } from "@/api/member";

type Option = {
  label: string;
  value: "RECOMMEND" | "LATEST";
};

const sortOptions: Option[] = [
  { label: "추천순", value: "RECOMMEND" },
  { label: "최신순", value: "LATEST" },
];

export default function ReviewListPage() {
  const { placeId } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 무한스크롤
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const isEmpty = reviews.length === 0;
  const [selectedOption, setSelectedOption] = useState<Option>(sortOptions[0]);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);
  const myMemberId = getCachedMyProfile()?.memberId ?? null;

  // 최초 로드 및 정렬 변경 시 재조회
  useEffect(() => {
    if (!placeId) return;
    let ignore = false;

    const fetchInitialReviews = async () => {
      try {
        setIsReviewsLoading(true);
        const data = await getReviews(Number(placeId), selectedOption.value);
        if (ignore) return; // 요청이 이미 시작된 응답이면 무시

        setReviews(data.reviews);
        setNextCursor(data.nextCursor);
        setHasNext(data.hasNext);
        if (data.totalCount !== null) {
          setTotalCount(data.totalCount);
        }
      } catch (e) {
        if (ignore) return;
        console.error(e);
        setReviewsError("리뷰 목록을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setIsReviewsLoading(false);
      }
    };
    fetchInitialReviews();

    return () => {
      ignore = true;
    };
  }, [placeId, selectedOption]);

  // 스크롤로 다음 페이지 불러오기
  const loadMoreReviews = async () => {
    if (!placeId || !nextCursor) return;
    try {
      setIsLoadingMore(true);
      const data = await getReviews(
        Number(placeId),
        selectedOption.value,
        nextCursor,
      );
      setReviews((prev) => [...prev, ...data.reviews]);
      setNextCursor(data.nextCursor);
      setHasNext(data.hasNext);
    } catch (e) {
      console.error(e);
      setReviewsError("리뷰 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const { ref } = useInView({
    threshold: 0.5,
    rootMargin: "200px",
    onChange: (inView) => {
      if (inView && hasNext && !isLoadingMore) {
        loadMoreReviews();
      }
    },
  });

  if (isReviewsLoading) return <BaseLoading />;
  if (reviewsError) return <p>{reviewsError}</p>;
  if (!reviews) return null;

  const toggleLike = (targetId: number) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.reviewId === targetId
          ? {
              ...r,
              isLiked: !r.isLiked,
              likeCount: r.isLiked ? r.likeCount - 1 : r.likeCount + 1,
            }
          : r,
      ),
    );
  };

  const handleToggleLike = async (review: Review) => {
    toggleLike(review.reviewId); // 낙관적 상태 업데이트

    try {
      if (review.isLiked) {
        await deleteReviewLike(review.reviewId);
      } else {
        await createReviewLike(review.reviewId);
      }
    } catch (e) {
      console.error(e);
      toggleLike(review.reviewId);
    }
  };

  return (
    <main className="flex flex-col h-dvh bg-gray-10 pt-[calc(var(--safe-top)+12px)] overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-4">
      {!totalCount ? (
        <Header showBack title="리뷰" />
      ) : (
        <Header showBack title={`리뷰 ${totalCount}개`} />
      )}

      {reportingReview && (
        <ReportModal
          mode="content"
          reportTarget={reportingReview.writerNickname}
          targetMemberId={reportingReview.writerId}
          targetType="PLACE_REVIEW"
          targetId={reportingReview.reviewId}
          onClose={() => setReportingReview(null)}
          onBlock={() => {
            const removedCount = reviews.filter(
              (r) => r.writerId === reportingReview.writerId,
            ).length;

            setReviews((prev) =>
              prev.filter((r) => r.writerId !== reportingReview.writerId),
            );
            setTotalCount((count) =>
              count === null ? count : Math.max(0, count - removedCount),
            );
          }}
        />
      )}

      <section className="flex flex-1 flex-col">
        {/* dropdown */}
        <section className="flex justify-center">
          <div className="flex justify-end w-[360px]">
            <Dropdown
              options={sortOptions}
              value={selectedOption.value}
              onSelect={(value) => {
                const option = sortOptions.find((opt) => opt.value === value);
                if (option) setSelectedOption(option);
              }}
            />
          </div>
        </section>

        {/* list */}
        <section
          className={`flex flex-1 justify-center ${isEmpty ? "items-start pt-[200px]" : "pt-4"}`}
        >
          {isEmpty ? (
            <div className="flex flex-col items-center gap-[34px]">
              <Empty />
              <div className="flex flex-col gap-2">
                <span className="text-title-02 text-gray-70 font-semibold text-center leading-[1.4] tracking-[-0.45px]">
                  아직 등록된 리뷰가 없어요!
                </span>
                <p className="text-body-02 text-gray-60 text-center leading-[1.4] tracking-[-0.025em]">
                  혹시 이 장소에 다녀오셨나요?
                  <br />
                  다녀오셨다면 여행 기록을 작성해보시면 어때요?
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.reviewId}
                  writerNickname={review.writerNickname}
                  writerProfileImageUrl={review.writerProfileImageUrl}
                  content={review.content}
                  imageUrl={review.imageUrl}
                  likeCount={review.likeCount}
                  isLiked={review.isLiked}
                  onToggleLike={() => handleToggleLike(review)}
                  createdAt={review.createdAt}
                  isMine={review.writerId === myMemberId}
                  onReport={() => setReportingReview(review)}
                />
              ))}
              {isLoadingMore && (
                <p className="text-body-02 text-gray-60 py-4">불러오는 중...</p>
              )}
            </div>
          )}
        </section>
        <div ref={ref} className="h-1 w-full"></div>
      </section>
    </main>
  );
}
