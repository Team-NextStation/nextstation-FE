import Header from "@/components/Header";
import PullToRefresh from "@/components/PullToRefresh";
import UnwrittenJournalCard from "./components/UnwrittenJournalCard";
import {
  getJournalWriteInfo,
  getUnwrittenJournals,
  type Course,
  type UnwrittenJournals,
} from "@/api/journal";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogDraft } from "../course/contexts/LogDraftContext";
import { formatAcquiredAtToDisplayDate } from "@/utils/logDate";
import { showToast } from "../course/components/ShowToast";

export default function UnwrittenJournalListPage() {
  const navigate = useNavigate();
  const { draft, initializeFromStamp } = useLogDraft();
  const [initializingId, setInitializingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listRequestPending = useRef(false);

  const [unwrittenJournal, setUnwrittenJournal] =
    useState<UnwrittenJournals | null>(null);

  const fetchUnwrittenJournals = useCallback(async () => {
    if (listRequestPending.current) return;
    listRequestPending.current = true;
    try {
      const data = await getUnwrittenJournals();
      setUnwrittenJournal(data);
      setError(null);
    } finally {
      listRequestPending.current = false;
    }
  }, []);

  const loadUnwrittenJournals = useCallback(() => {
    void fetchUnwrittenJournals().catch((error) => {
      console.error(error);
      setError("여행일지 목록을 불러오지 못했습니다.");
    });
  }, [fetchUnwrittenJournals]);

  useEffect(() => {
    loadUnwrittenJournals();
  }, [loadUnwrittenJournals]);

  const initializeJournalWriteInfo = async (course: Course) => {
    setInitializingId(course.memberStampId);

    try {
      const writeInfo = await getJournalWriteInfo(course.memberStampId);
      const placeReviews = writeInfo.places
        .slice()
        .sort((a, b) => a.orderNum - b.orderNum)
        .map((place) => ({
          id: place.placeId,
          label: place.placeName,
          review: "",
          photo: null,
        }));

      initializeFromStamp({
        memberStampId: course.memberStampId,
        stationId: 0,
        stationName: writeInfo.stationName,
        acquiredDate: formatAcquiredAtToDisplayDate(course.acquiredAt),
        logName: writeInfo.courseName,
        tags: writeInfo.tags,
        placeReviews,
      });

      return true;
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "여행일지 초기 정보를 불러오지 못했습니다.",
      });
      return false;
    } finally {
      setInitializingId(null);
    }
  };

  const handleSelectCourse = async (course: Course) => {
    const isInitialized =
      (draft.memberStampId === course.memberStampId &&
        draft.placeReviews.length > 0) ||
      (await initializeJournalWriteInfo(course));

    if (!isInitialized) return;

    navigate(`/course/${course.memberStampId}/log/info`);
  };

  return (
    <PullToRefresh
      onRefresh={fetchUnwrittenJournals}
      disabled={initializingId !== null}
      className="flex flex-col h-dvh bg-gray-10 pt-[calc(var(--safe-top)+12px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-2.5"
    >
      <Header showBack />

      {/* text */}
      <header className="flex flex-col w-full gap-1 px-[15px]">
        <span className="text-title-01 font-semibold leading-[1.4] tracking-[-0.5px] text-gray-100">
          여행일지 작성하기
        </span>
        <p className="text-body-02 leading-[1.4] tracking-[-0.3px] text-gray-70">
          여행을 선택해 여행일지를 작성해 보세요.
        </p>
      </header>

      {/* list */}
      <section className="flex justify-center">
        <div className="flex flex-col items-center gap-[9px] py-4">
          {error ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-body-02 text-gray-70">{error}</p>
              <button
                type="button"
                onClick={loadUnwrittenJournals}
                className="text-body-02 text-primary-60 underline"
              >
                다시 시도
              </button>
            </div>
          ) : (
            unwrittenJournal?.courses.map((course) => (
              <UnwrittenJournalCard
                key={course.memberStampId}
                course={course}
                disabled={initializingId === course.memberStampId}
                onClick={() => void handleSelectCourse(course)}
              />
            ))
          )}
        </div>
      </section>
    </PullToRefresh>
  );
}
