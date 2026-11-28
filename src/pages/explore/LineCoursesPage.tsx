import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate, useSearchParams } from "react-router-dom";
import ExploreCourseItem from "./components/ExploreCourseItem";
import ExploreDropdown from "./components/ExploreDropdown";
import Header from "@/components/Header";
import CloseIcon from "@/assets/close.svg?react";
import ArrowDown from "@/assets/arrow-down.svg?react";
import {
  getExploreCourses,
  getExploreCourseDetailPath,
  getExploreMain,
  type ExploreCourse,
  type ExploreLine,
  type ExploreSort,
  type ExploreStation,
} from "@/api/explore";
import ExploreLineTabs from "./components/ExploreLineTabs";
import { stationsByLine } from "@/data/stationsByLine";
import { searchStations } from "@/api/stations";
import { getDisplayedExploreLines } from "./utils/exploreLines";
import { useListHistoryValue, useListScrollRestoration } from "@/hooks/useListScrollRestoration";

type SortOption = "인기순" | "최신순";
export default function LineCoursesPage() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLElement>(null);
  const restoreScroll = useListScrollRestoration();
  const setPageRef = useCallback((element: HTMLElement | null) => {
    pageRef.current = element;
    restoreScroll(element);
  }, [restoreScroll]);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedLineId = Number(searchParams.get("line"));
  const [station, setStation] = useListHistoryValue<ExploreStation | null>("station", null);
  const [sortOption, setSortOption] = useListHistoryValue<SortOption>("sort", "인기순");
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const stationButtonRef = useRef<HTMLButtonElement>(null);
  const stationDialogRef = useRef<HTMLElement>(null);
  const [lines, setLines] = useState<ExploreLine[]>([]);
  const [stationNames, setStationNames] = useState<ExploreStation[]>([]);
  const [resolvingStationName, setResolvingStationName] = useState<
    string | null
  >(null);
  const [courses, setCourses] = useState<ExploreCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const isLoadingMoreRef = useRef(false);
  const { ref: loadMoreRef, inView } = useInView({ rootMargin: "120px" });
  const selectedLine =
    lines.find((lineItem) => lineItem.id === requestedLineId) ??
    lines[0] ??
    null;
  const lineId = selectedLine?.id;
  const lineName = selectedLine?.name ?? "";

  useEffect(() => {
    void getExploreMain()
      .then((data) => {
        const displayedLines = getDisplayedExploreLines(data.lines);
        const initialLine =
          displayedLines.find(
            (lineItem) => lineItem.id === requestedLineId,
          ) ??
          displayedLines.find(
            (lineItem) => lineItem.id === data.selectedLineId,
          ) ??
          displayedLines[0];

        setLines(displayedLines);
        if (initialLine && initialLine.id !== requestedLineId) {
          setSearchParams(
            { line: String(initialLine.id) },
            { replace: true },
          );
        }
      })
      .catch(() => {
        setLines([]);
        setIsLoading(false);
      });
  }, [requestedLineId, setSearchParams]);

  useEffect(() => {
    if (!lineId) return undefined;

    let isActive = true;
    const sort: ExploreSort = sortOption === "인기순" ? "POPULAR" : "LATEST";
    void getExploreCourses({
      lineId,
      stationId: station?.stationId,
      sort,
      size: 50,
    })
      .then((data) => {
        if (!isActive) return;
        setCourses(data.courses);
        setStationNames(data.availableStations);
        setNextCursor(data.nextCursor);
        setHasNext(data.hasNext);
      })
      .catch(() => {
        if (!isActive) return;
        setCourses([]);
        setStationNames([]);
        setNextCursor(null);
        setHasNext(false);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [lineId, sortOption, station]);

  useEffect(() => {
    if (
      !lineId ||
      !inView ||
      !hasNext ||
      !nextCursor ||
      isLoadingMoreRef.current
    )
      return;

    const sort: ExploreSort = sortOption === "인기순" ? "POPULAR" : "LATEST";
    isLoadingMoreRef.current = true;
    void getExploreCourses({
      lineId,
      stationId: station?.stationId,
      sort,
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
  }, [hasNext, inView, lineId, nextCursor, sortOption, station]);

  const handleLineChange = (nextLine: number) => {
    pageRef.current?.scrollTo({ top: 0, behavior: "auto" });
    setStation(null);
    setNextCursor(null);
    setHasNext(false);
    setIsLoading(true);
    setSearchParams({ line: String(nextLine) }, { replace: true });
  };

  const handleStationChange = async (stationName: string) => {
    const availableStation = stationNames.find(
      (stationItem) => stationItem.stationName === stationName,
    );

    setResolvingStationName(stationName);
    try {
      const selectedStation =
        availableStation ??
        (await searchStations(stationName).then((stations) => {
          const matchedStation = stations.find(
            (stationItem) =>
              stationItem.name === stationName &&
              stationItem.lines.some(
                (stationLine) => stationLine.code === selectedLine?.code,
              ),
          );

          return matchedStation
            ? {
                stationId: matchedStation.id,
                stationName: matchedStation.name,
                hasCourses: false,
              }
            : null;
        }));

      if (!selectedStation) return;

      setStation(selectedStation);
      setNextCursor(null);
      setHasNext(false);
      setIsLoading(true);
      setIsStationMenuOpen(false);
    } catch {
      return;
    } finally {
      setResolvingStationName(null);
    }
  };

  useEffect(() => {
    if (!isStationMenuOpen) {
      return undefined;
    }

    const dialog = stationDialogRef.current;
    const focusableElements = dialog?.querySelectorAll<HTMLElement>("button");
    focusableElements?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsStationMenuOpen(false);
        stationButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !focusableElements?.length) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isStationMenuOpen]);

  return (
    <main
      ref={setPageRef}
      className="flex h-dvh flex-col bg-gray-10 text-gray-100 leading-[1.4] tracking-[-0.025em] pt-[calc(var(--safe-top)+12px)] text-gray-100 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <Header showBack />
      <div className=" px-[15px]">
        <h1 className="text-title-01 font-semibold leading-[1.4] tracking-[-0.025em]">
          노선따라 둘러보기
        </h1>
      </div>

      <ExploreLineTabs
        lines={lines}
        selectedLine={lineId ?? null}
        onSelect={handleLineChange}
      />

      <div className="flex items-start justify-between px-[15px] py-2">
        <button
          ref={stationButtonRef}
          type="button"
          className="flex h-9 min-w-[111px] items-end justify-between gap-3 rounded-lg border border-white bg-white/50 px-5 py-2 text-body-01 font-semibold leading-[1.4] text-gray-70 backdrop-blur-[10px]"
          aria-haspopup="dialog"
          aria-expanded={isStationMenuOpen}
          onClick={() => {
            setIsStationMenuOpen(true);
          }}
        >
          {station?.stationName || "역 선택"}
          <ArrowDown
            className={`size-5 shrink-0 transition-transform ${isStationMenuOpen ? "rotate-180" : "rotate-0"}`}
            aria-hidden="true"
          />
        </button>

        <ExploreDropdown
          ariaLabel="코스 정렬"
          options={["인기순", "최신순"] as const}
          value={sortOption}
          onChange={(nextSort) => {
            setSortOption(nextSort);
            setNextCursor(null);
            setHasNext(false);
            setIsLoading(true);
          }}
        />
      </div>

      <section
        className="flex flex-col gap-3 px-[15px] py-7"
        aria-label={`${lineName} 코스 목록`}
      >
        {isLoading && (
          <p className="py-16 text-center text-body-01 text-gray-60">
            코스를 불러오는 중...
          </p>
        )}
        {!isLoading && courses.length === 0 && (
          <p className="py-16 text-center text-body-01 text-gray-60">
            이 조건에 맞는 코스가 아직 없어요.
          </p>
        )}
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
      {hasNext && <div ref={loadMoreRef} className="h-px" aria-hidden="true" />}

      {isStationMenuOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-gray-100/15 px-[15px] pb-[50px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsStationMenuOpen(false);
            }
          }}
        >
          <section
            ref={stationDialogRef}
            className="flex max-h-[calc(100dvh-48px)] w-[360px] max-w-full flex-col items-center justify-start gap-3 rounded-lg bg-white/50 px-6 pb-8 pt-6 shadow-[0_0_28px_rgb(118_118_118/25%)] backdrop-blur-[10px] outline outline-1 outline-offset-[-1px] outline-white"
            role="dialog"
            aria-modal="true"
            aria-labelledby="station-menu-title"
          >
            <div className="flex w-full items-center justify-between pb-3 pt-2">
              <h2
                className="text-subtitle font-semibold leading-[1.4] text-gray-70"
                id="station-menu-title"
              >
                역 선택
              </h2>
              <button
                className="size-[23px] border-0 bg-transparent p-0"
                type="button"
                onClick={() => setIsStationMenuOpen(false)}
                aria-label="역 선택 닫기"
              >
                <CloseIcon className="size-[23px]" aria-hidden="true" />
              </button>
            </div>
            <div className="flex max-h-[250px] w-full flex-col items-start gap-4 overflow-y-auto [scrollbar-width:none]">
              <button
                type="button"
                className={`w-full border-0 bg-transparent p-0 text-left text-subtitle font-semibold leading-[1.4] ${!station ? "text-gray-100" : "text-gray-60"}`}
                onClick={() => {
                  setStation(null);
                  setNextCursor(null);
                  setHasNext(false);
                  setIsLoading(true);
                  setIsStationMenuOpen(false);
                }}
              >
                전체
              </button>
              {(stationsByLine[lineName] ?? []).map((stationName) => (
                <button
                  type="button"
                  aria-pressed={station?.stationName === stationName}
                  disabled={resolvingStationName !== null}
                  className={`w-full border-0 bg-transparent p-0 text-left text-subtitle font-semibold leading-[1.4] ${station?.stationName === stationName ? "text-gray-100" : "text-gray-60"}`}
                  onClick={() => void handleStationChange(stationName)}
                  key={stationName}
                >
                  {stationName.replace(/역$/, "")}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
