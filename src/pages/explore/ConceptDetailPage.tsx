import { useEffect, useRef, useState } from "react";
import { useListHistoryValue, useListScrollRestoration } from "@/hooks/useListScrollRestoration";
import { useInView } from "react-intersection-observer";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getConceptTourCourses,
  getConceptTours,
  getExploreCourseDetailPath,
  type ConceptTour,
  type ExploreCourse,
  type ExploreSort,
} from "@/api/explore";
import BaseLoading from "@/components/BaseLoading";
import Header from "@/components/Header";
import ErrorPage from "@/pages/ErrorPage";
import ExploreCourseItem from "./components/ExploreCourseItem";
import ExploreDropdown from "./components/ExploreDropdown";
import { getConceptTourDesignByData } from "./data/conceptTours";

type ExploreSortOption = "인기순" | "최신순";

export default function ConceptDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conceptId = "" } = useParams();
  const numericConceptId = Number(conceptId);
  const navigationState = location.state as {
    conceptTour?: ConceptTour;
  } | null;
  const navigatedTour = navigationState?.conceptTour;
  const initialTour =
    navigatedTour?.conceptTourId === numericConceptId ? navigatedTour : null;
  const [sort, setSort] = useListHistoryValue<ExploreSortOption>("sort", "인기순");
  const restoreScroll = useListScrollRestoration();
  const [tour, setTour] = useState<ConceptTour | null>(initialTour);
  const [courses, setCourses] = useState<ExploreCourse[] | null>(null);
  const [isLoading, setIsLoading] = useState(!initialTour);
  const [hasError, setHasError] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const { ref: loadMoreRef, inView } = useInView({ rootMargin: "120px" });

  useEffect(() => {
    let isActive = true;

    void getConceptTours()
      .then((items) => {
        const matchingTour = items.find(
          (item) => item.conceptTourId === numericConceptId,
        );
        if (!matchingTour)
          throw new Error("Concept tour data is unavailable");
        if (!isActive) return;

        setTour(matchingTour);
        setHasError(false);
      })
      .catch(() => {
        if (!isActive) return;
        if (!initialTour) {
          setTour(null);
          setHasError(true);
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [initialTour, numericConceptId]);

  useEffect(() => {
    if (!tour) return;

    const apiSort: ExploreSort = sort === "인기순" ? "POPULAR" : "LATEST";
    let isActive = true;
    void getConceptTourCourses(tour.conceptTourId, apiSort)
      .then((response) => {
        if (!isActive) return;
        setCourses(response.courses);
        setHasError(false);
        setNextCursor(response.nextCursor);
        setHasNext(response.hasNext);
      })
      .catch(() => {
        if (!isActive) return;
        setCourses([]);
        setHasError(true);
        setNextCursor(null);
        setHasNext(false);
      });

    return () => {
      isActive = false;
    };
  }, [sort, tour]);

  useEffect(() => {
    if (!tour || !inView || !hasNext || !nextCursor || isLoadingMoreRef.current)
      return;

    const apiSort: ExploreSort = sort === "인기순" ? "POPULAR" : "LATEST";
    isLoadingMoreRef.current = true;
    void getConceptTourCourses(
      tour.conceptTourId,
      apiSort,
      nextCursor,
      10,
    )
      .then((response) => {
        setCourses((current) => [...(current ?? []), ...response.courses]);
        setNextCursor(response.nextCursor);
        setHasNext(response.hasNext);
      })
      .catch(() => setHasNext(false))
      .finally(() => {
        isLoadingMoreRef.current = false;
      });
  }, [hasNext, inView, nextCursor, sort, tour]);

  const design = tour ? getConceptTourDesignByData(tour) : null;

  if ((isLoading && !tour) || (tour && courses === null)) {
    return <BaseLoading />;
  }

  if (hasError) {
    return <ErrorPage />;
  }

  return (
    <main ref={restoreScroll} className="flex h-dvh flex-col bg-gray-10 text-gray-100 pt-[calc(var(--safe-top)+12px)] text-gray-100 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Header showBack />

      {!hasError && tour && (
        <>
          <header className="flex h-[122px] items-start justify-between pl-[15px] pr-6">
            <div className="min-w-0 pt-[26px]">
              <h1 className="mb-1 text-title-01 font-semibold leading-[1.4] tracking-[-0.025em]">
                {tour.name}
              </h1>
              <p className="whitespace-pre-line text-body-01 leading-[1.4] tracking-[-0.025em] text-gray-70">
                {tour.description}
              </p>
            </div>
            {design && (
              <div className="-mt-9 flex size-[134px] w-[140px] shrink-0 items-center justify-center">
                <design.Artwork
                  className={`shrink-0 object-contain ${design.detailArtworkClassName}`}
                  aria-hidden="true"
                />
              </div>
            )}
          </header>

          <div className="mx-[15px] flex h-9 justify-end">
            <ExploreDropdown
              ariaLabel="코스 정렬"
              options={["인기순", "최신순"] as const}
              value={sort}
              onChange={(nextSort) => {
                setCourses(null);
                setNextCursor(null);
                setHasNext(false);
                setSort(nextSort);
              }}
            />
          </div>

          <section
            className="flex flex-col gap-3 px-[15px] pb-5 pt-4"
            aria-label={`${tour.name} ${sort}`}
          >
            {courses !== null && courses.length === 0 && (
              <p className="py-16 text-center text-body-01 text-gray-60">
                이 컨셉의 코스가 아직 없어요.
              </p>
            )}
            {courses?.map((course) => (
              <ExploreCourseItem
                key={course.courseId}
                courseId={course.courseId}
                line={course.line}
                stationName={course.stationName}
                name={course.name}
                tags={course.tags}
                likeCount={course.likeCount}
                isLiked={course.isLiked}
                imageUrl={course.imageUrl}
                onClick={() => navigate(getExploreCourseDetailPath(course))}
              />
            ))}
          </section>
          {hasNext && (
            <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
          )}
        </>
      )}
    </main>
  );
}
