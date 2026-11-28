import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate, useSearchParams } from "react-router-dom";
import BackIcon from "@/assets/back.svg?react";
import SearchEmpty from "@/assets/explore/search-empty.svg?react";
import {
  getConceptTours,
  getExploreCourseDetailPath,
  getExploreCourses,
  type ConceptTour,
  type ExploreCourse,
} from "@/api/explore";
import ConceptTourCard from "./components/ConceptTourCard";
import ExploreCourseItem from "./components/ExploreCourseItem";
import ExploreSearchBar from "./components/ExploreSearchBar";
import { getDisplayedConceptTours } from "./data/conceptTours";
import { useListScrollRestoration } from "@/hooks/useListScrollRestoration";

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const restoreScroll = useListScrollRestoration();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const isConceptSearch = searchParams.get("source") === "concept";
  const [courses, setCourses] = useState<ExploreCourse[]>([]);
  const [tours, setTours] = useState<ConceptTour[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const { ref: loadMoreRef, inView } = useInView({ rootMargin: "120px" });

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) return;

    if (isConceptSearch) {
      void getConceptTours()
        .then(setTours)
        .catch(() => setTours([]));
      return;
    }

    void getExploreCourses({ keyword, sort: "POPULAR", size: 50 })
      .then((data) => {
        setCourses(data.courses);
        setNextCursor(data.nextCursor);
        setHasNext(data.hasNext);
      })
      .catch(() => {
        setCourses([]);
        setNextCursor(null);
        setHasNext(false);
      });
  }, [isConceptSearch, query]);

  useEffect(() => {
    const keyword = query.trim();
    if (
      isConceptSearch ||
      !keyword ||
      !inView ||
      !hasNext ||
      !nextCursor ||
      isLoadingMoreRef.current
    )
      return;

    isLoadingMoreRef.current = true;
    void getExploreCourses({
      keyword,
      sort: "POPULAR",
      cursor: nextCursor,
      size: 50,
    })
      .then((data) => {
        setCourses((current) => [...current, ...data.courses]);
        setNextCursor(data.nextCursor);
        setHasNext(data.hasNext);
      })
      .catch(() => setHasNext(false))
      .finally(() => {
        isLoadingMoreRef.current = false;
      });
  }, [hasNext, inView, isConceptSearch, nextCursor, query]);

  const conceptResults = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return getDisplayedConceptTours(tours).filter(({ tour }) =>
      `${tour.name} ${tour.description}`.toLowerCase().includes(keyword),
    );
  }, [query, tours]);

  const hasResults = isConceptSearch
    ? conceptResults.length > 0
    : courses.length > 0;

  return (
    <main ref={restoreScroll} className="flex flex-col h-dvh overflow-y-auto bg-gray-10 text-gray-100 pt-[calc(var(--safe-top)+12px)]">
      <header className="flex h-[50px] shrink-0 items-center gap-4 px-3">
        <button
          type="button"
          className="size-6 shrink-0 border-0 bg-transparent p-0"
          aria-label="이전"
          onClick={() => navigate(-1)}
        >
          <BackIcon className="size-6" aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <ExploreSearchBar
            key={query}
            onSubmit={(value) => {
              setNextCursor(null);
              setHasNext(false);
              setSearchParams(
                value
                  ? {
                      q: value,
                      ...(isConceptSearch ? { source: "concept" } : {}),
                    }
                  : {},
              );
            }}
            defaultValue={query}
          />
        </div>
      </header>

      {hasResults ? (
        isConceptSearch ? (
          <section className="grid grid-cols-2 gap-3 px-[15px] pt-4">
            {conceptResults.map(({ tour, design }) => (
              <ConceptTourCard
                key={tour.conceptTourId}
                Artwork={design.Artwork}
                artworkClassName={design.artworkClassName}
                name={tour.name}
                description={tour.description}
                courseCount={tour.courseCount}
                onClick={() =>
                  navigate(`/explore/concepts/${tour.conceptTourId}`, {
                    state: { conceptTour: tour },
                  })
                }
              />
            ))}
          </section>
        ) : (
          <section className="flex flex-col gap-3 px-[15px] py-4">
            {courses.map((course) => (
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
        )
      ) : (
        <section className="flex flex-col items-center gap-5 pt-[163px]">
          <SearchEmpty className="h-[200px] w-[222px]" aria-hidden="true" />
          <p className="text-center text-subtitle leading-[1.4] tracking-[-0.025em] text-gray-80">
            일치하는 검색 결과가 없어요
          </p>
        </section>
      )}
      {!isConceptSearch && hasNext && (
        <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
      )}
    </main>
  );
}
