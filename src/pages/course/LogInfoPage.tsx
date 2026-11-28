import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import CTAButton from "@/components/CTAButton";
import Header from "@/components/Header";
import TimeChip from "./components/TimeChip";
import LogPhotoUploader from "./components/LogPhotoUploader";
import LogDatePickerModal from "./components/date-picker/LogDatePickerModal";
import CalendarIcon from "@/assets/calendar.svg?react";
import ConfirmModal from "@/components/ConfirmModal";
import NameEditInput from "./components/NameEditInput";
import { useLogDraft } from "./contexts/LogDraftContext";
import { useBackNavigation } from "@/hooks/useBackNavigation";

const timeOptions = ["3~4시간", "반나절", "하루종일"];

function LogInfoPage() {
  const navigate = useNavigate();
  const goBack = useBackNavigation("/course", { registerSwipe: false });
  const { courseId } = useParams();
  const {
    draft,
    setLogName,
    setSelectedDate,
    setSelectedTime,
    setReview,
    setPhotos,
    isDirty,
  } = useLogDraft();
  const stationName = draft.stationName ?? "환승역";
  const displayDate = draft.selectedDate ?? draft.acquiredDate;
  const isInfoComplete =
    draft.logName.trim() !== "" &&
    displayDate !== null &&
    draft.selectedTime !== null &&
    draft.review.trim() !== "";

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isLogConfirmOpen, setIsLogConfirmOpen] = useState(false);
  const confirmLeave = () => setIsLogConfirmOpen(true);

  return (
    <main className="flex flex-col h-dvh overflow-y-auto bg-gray-10 items-center pt-[var(--safe-top)] pb-[calc(var(--safe-bottom)+140px)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* 수정사항이 있을경우 경고 모달이 떠야함 */}
      <Header
        showClose
        onSwipeBack={isDirty ? confirmLeave : undefined}
        onCloseClick={() => {
          if (isDirty) {
            confirmLeave();
            return;
          }

          goBack();
        }}
      />
      {isLogConfirmOpen && (
        <ConfirmModal
          message={
            "해당 기록은 저장되지 않았습니다.\n저장하지 않고 나가시겠습니까?"
          }
          onClose={() => setIsLogConfirmOpen(false)}
          onConfirm={goBack}
        />
      )}
      {/* 코스 제목 */}
      <section className="flex flex-col w-[390px] p-5">
        <NameEditInput
          value={draft.logName}
          onChange={setLogName}
          className="border-none"
        />
      </section>

      <section className="flex flex-col w-[360px] items-start gap-8">
        {/* 방문 날짜 */}
        <div className="flex flex-col w-full items-start gap-4">
          <p className="text-subtitle font-semibold text-gray-100 leading-[1.4] tracking-[-0.025em]">
            방문 날짜
          </p>
          {/* 날짜 picker */}
          <div className="flex flex-col w-full gap-2">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
              className="flex w-full rounded-lg items-center justify-between px-[10px] py-2 bg-white outline-none"
            >
              <span
                className={`
                  text-body-01 leading-[1.4] tracking-[-0.025em]
                  ${displayDate ? "text-gray-100" : "text-gray-70"}
                `}
              >
                {displayDate ?? "날짜를 선택해주세요"}
              </span>
              <CalendarIcon className="size-6" />
            </button>

            {isDatePickerOpen && (
              <LogDatePickerModal
                defaultDate={draft.acquiredDate}
                selectedDate={draft.selectedDate}
                onClose={() => setIsDatePickerOpen(false)}
                onConfirm={(date) => {
                  setSelectedDate(date);
                  setIsDatePickerOpen(false);
                }}
              />
            )}
          </div>
        </div>

        {/* 코스 시간 */}
        <div className="flex flex-col w-full items-start gap-4">
          <div className="flex flex-col items-start gap-2">
            <p className="text-subtitle font-semibold text-gray-100 leading-[1.4] tracking-[-0.025em]">
              코스 시간
            </p>
            <p className="text-body-02 text-gray-70 leading-[1.4] tracking-[-0.025em]">
              이 코스의 소요 시간은 얼마나 걸렸나요?
            </p>
          </div>
          <div className="flex items-center gap-2">
            {timeOptions.map((option) => (
              <TimeChip
                key={option}
                label={option}
                selected={draft.selectedTime === option}
                onClick={() => setSelectedTime(option)}
              />
            ))}
          </div>
        </div>

        {/* 여행 대표 사진 추가 */}
        <div className="flex flex-col w-full items-start gap-4">
          <div className="flex flex-col items-start gap-2">
            <p className="text-subtitle font-semibold text-gray-100 leading-[1.4] tracking-[-0.025em]">
              여행 대표 사진 추가
            </p>
            <p className="text-body-02 text-gray-70 leading-[1.4] tracking-[-0.025em]">
              이 여행을 기억할 수 있는 대표 사진을 추가해보세요.
            </p>
          </div>

          {/* 사진 추가 아이콘 */}
          <LogPhotoUploader photos={draft.photos} onChange={setPhotos} />
        </div>

        {/* 내 여행 돌아보기 */}
        <div className="flex flex-col w-full items-start gap-4">
          <p className="text-subtitle font-semibold text-gray-100  leading-[1.4] tracking-[-0.025em]">
            내 여행 돌아보기
          </p>
          <div className="flex w-full h-[200px] rounded-lg p-4 gap-[10px] bg-white">
            <textarea
              value={draft.review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={`오늘 ${stationName} 여행은 어땠나요?`}
              className="w-full h-full resize-none bg-transparent caret-primary-50 text-body-01 text-gray-100 placeholder:text-gray-50 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="fixed inset-x-0 bottom-[calc(var(--safe-bottom)+10px)] z-10 flex flex-col items-center justify-center">
        <CTAButton
          disabled={!isInfoComplete}
          onClick={() => navigate(`/course/${courseId}/log/place`)}
        >
          다음
        </CTAButton>
      </section>
    </main>
  );
}
export default LogInfoPage;
