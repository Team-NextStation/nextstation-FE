import Heart from "@/assets/heart.svg?react";
import BaseLoading from "@/components/BaseLoading";
import CourseEmpty from "@/assets/course-empty.svg?react";
import SavedCourseCard from "./components/SavedCourseCard";
import { useCallback, useEffect, useRef, useState } from "react";
import CompleteConfirmModal from "./components/CompleteConfirmModal";
import StationCategory from "./components/StationCategory";
import ConfirmModal from "@/components/ConfirmModal";
import BottomNav from "@/components/BottomNav";
import PullToRefresh from "@/components/PullToRefresh";
import { useListHistoryValue } from "@/hooks/useListScrollRestoration";
import {
  deleteSavedCourses,
  getSavedCourses,
  type Course,
} from "@/api/savedCourse";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { showToast } from "./components/ShowToast";

export default function MainPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const isCourseEmpty = courses.length < 1;
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useListHistoryValue("line", "전체");
  const [selectedStation, setSelectedStation] = useListHistoryValue("station", "전체");
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const listRequestPending = useRef(false);

  const fetchCourses = useCallback(async () => {
    if (listRequestPending.current) return;
    listRequestPending.current = true;
    try {
      const data = await getSavedCourses();
      setCourses(data.courses ?? []);
      setNextCursor(data.nextCursor);
      setHasNext(data.hasNext);
      setInitialLoadError(null);
    } finally {
      listRequestPending.current = false;
    }
  }, []);

  useEffect(() => {
    void fetchCourses().catch((error) => {
      console.error(error);
      setInitialLoadError("내가 만든 코스 목록을 불러오지 못했습니다.");
    }).finally(() => setIsCoursesLoading(false));
  }, [fetchCourses]);

  const loadMoreCourses = async () => {
    if (!nextCursor || listRequestPending.current) return;

    listRequestPending.current = true;
    try {
      setIsLoadingMore(true);
      const data = await getSavedCourses(nextCursor);
      setCourses((prev) => [...prev, ...(data.courses ?? [])]);
      setNextCursor(data.nextCursor);
      setHasNext(data.hasNext);
    } catch (e) {
      console.error(e);
      showToast({ message: "코스 목록을 더 불러오지 못했습니다." });
    } finally {
      listRequestPending.current = false;
      setIsLoadingMore(false);
    }
  };

  const { ref } = useInView({
    threshold: 0.5,
    rootMargin: "200px",
    onChange: (inView) => {
      if (inView && hasNext && !isLoadingMore) {
        void loadMoreCourses();
      }
    },
  });

  if (isCoursesLoading) return <BaseLoading />;
  if (!courses) return null;

  const handleCompletedClick = (course: Course) => {
    setSelectedCourse(course);
    setIsCompleteModalOpen(true);
  };

  const closeCompleteModal = () => {
    setIsCompleteModalOpen(false);
    setSelectedCourse(null);
  };

  const handleCourseCompleted = (courseId: number) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.courseId === courseId
          ? { ...course, isCompleted: true }
          : course,
      ),
    );
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedIds([]);
  };

  const filteredCourses = courses.filter((course) => {
    const matchedLine =
      selectedLine === "전체" || course.line.name === selectedLine;
    const matchedStation =
      selectedStation === "전체" || course.stationName === selectedStation;

    return matchedLine && matchedStation;
  });
  const isFilteredCoursesEmpty = filteredCourses.length < 1;

  const handleSelected = (targetId: number) => {
    setSelectedIds((prev) =>
      prev.includes(targetId)
        ? prev.filter((value) => value !== targetId)
        : [...prev, targetId],
    );
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteSavedCourses(selectedIds);
      setCourses((prev) =>
        prev.filter((course) => !selectedIds.includes(course.courseId)),
      );
      setSelectedIds([]);
      setIsDeleteMode(false);
      setIsDeleteModalOpen(false);
    } catch (e) {
      console.error(e);
      showToast({ message: "코스 삭제에 실패했습니다." });
    }
  };

  return (
    <PullToRefresh
      onRefresh={fetchCourses}
      fixedContent={<BottomNav mode="course" />}
      restorationPagination={{
        cursor: hasNext && !isLoadingMore ? nextCursor : null,
        loadMore: loadMoreCourses,
      }}
      disabled={isDeleteMode || isCompleteModalOpen || isDeleteModalOpen || isLoadingMore}
      className="flex h-dvh flex-col overflow-y-auto bg-gray-10 pt-[calc(var(--safe-top)+12px)] pb-[var(--bottom-nav-offset)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <header className="flex w-full items-center justify-between px-[15px]">
        <span className="text-title-02 font-semibold leading-[1.4] tracking-[-0.45px]">
          내가 만든 코스
        </span>
        <button type="button" onClick={() => navigate("/course/like")}>
          <Heart />
        </button>
      </header>

      {isCompleteModalOpen && selectedCourse && (
        <CompleteConfirmModal
          onClose={closeCompleteModal}
          courseId={selectedCourse.courseId}
          stationName={selectedCourse.stationName}
          onCompleted={handleCourseCompleted}
        />
      )}

      {isDeleteModalOpen && selectedIds.length > 0 && (
        <ConfirmModal
          message="저장한 코스를 삭제하시겠습니까?"
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}

      <section className="flex justify-center">
        <div className="flex w-[390px]">
          <StationCategory
            selectedLine={selectedLine}
            onSelectLine={setSelectedLine}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
          />
        </div>
      </section>

      <section className="flex justify-center">
        <div className="flex w-[390px]">
          <button
            type="button"
            className={`flex pt-2 pb-4 pl-[346px] text-body-01 leading-[1.4] tracking-[-0.35px] ${isDeleteMode && selectedIds.length > 0 ? "text-primary-60" : "text-gray-70"}`}
            onClick={() =>
              isDeleteMode
                ? selectedIds.length > 0
                  ? setIsDeleteModalOpen(true)
                  : setIsDeleteMode(false)
                : setIsDeleteMode(true)
            }
          >
            삭제
          </button>
        </div>
      </section>

      <section className="flex justify-center pb-4">
        {initialLoadError ? (
          <p className="px-[15px] text-body-01 text-gray-70" role="alert">{initialLoadError}</p>
        ) : isCourseEmpty || isFilteredCoursesEmpty ? (
          <div className="flex flex-col gap-5 items-center justify-center pt-20">
            <CourseEmpty />
            <p className="text-subtitle leading-[1.4] tracking-[-0.4px] text-gray-80 text-center">
              {isCourseEmpty ? (
                <>
                  아직 저장된 코스가 없어요!
                  <br />
                  나만의 환승여행 코스를 만들어보세요.
                </>
              ) : (
                <>
                  선택한 조건에 맞는 코스가 없어요!
                  <br />
                  다른 노선이나 역을 선택해보세요.
                </>
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-[9px]">
              {filteredCourses.map((course) => (
                <SavedCourseCard
                  key={course.courseId}
                  courseId={course.courseId}
                  name={course.name}
                  line={course.line.name}
                  stationName={course.stationName}
                  isCompleted={course.isCompleted}
                  onCompletedClick={() => handleCompletedClick(course)}
                  isDeleteMode={isDeleteMode}
                  isSelect={selectedIds.includes(course.courseId)}
                  handleSelected={handleSelected}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <div ref={ref} className="h-1 w-full" />

    </PullToRefresh>
  );
}
