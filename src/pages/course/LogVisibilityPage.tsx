import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import CTAButton from "@/components/CTAButton";
import ConfirmModal from "@/components/ConfirmModal";
import { createJournal, type TravelDuration } from "@/api/journal";
import LogPreviewCard from "./components/LogPreviewCrad";
import VisibilityCard from "./components/VisibilityCard";
import { useLogDraft } from "./contexts/LogDraftContext";
import { showToast } from "./components/ShowToast";
import { useBackNavigation } from "@/hooks/useBackNavigation";

const TRAVEL_DURATION_MAP: Record<string, TravelDuration> = {
  "3~4시간": "SHORT",
  반나절: "HALF_DAY",
  하루종일: "FULL_DAY",
};

function toApiDate(date: string) {
  return date.replaceAll(".", "-");
}

function LogVisibilityPage() {
  const navigate = useNavigate();
  const goBack = useBackNavigation("/course", { registerSwipe: false });
  const [isLogConfirmOpen, setIsLogConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { draft, discardChanges, setVisibility, isDirty } = useLogDraft();
  const stationName = draft.stationName ?? "환승역";

  const handleSave = async () => {
    if (isSubmitting) return;

    const traveledDate = draft.selectedDate ?? draft.acquiredDate;
    const travelDuration =
      draft.selectedTime !== null
        ? TRAVEL_DURATION_MAP[draft.selectedTime]
        : null;

    if (!draft.memberStampId || !traveledDate || !travelDuration) {
      showToast({ message: "여행일지 저장에 필요한 정보가 부족합니다." });
      return;
    }

    setIsSubmitting(true);

    try {
      await createJournal({
        memberStampId: draft.memberStampId,
        title: draft.logName,
        overallReview: draft.review,
        traveledAt: toApiDate(traveledDate),
        travelDuration,
        isPublic: draft.visibility === "public",
        journalImageUrls: draft.photos,
        placeReviews: draft.placeReviews.map((place) => ({
          placeId: place.id,
          review: place.review,
          imageUrl: place.photo,
        })),
      });

      showToast({
        message: "여행일지가 저장되었습니다.",
      });
      navigate("/course");
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "여행일지 저장에 실패했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col h-dvh overflow-y-auto bg-gray-10 items-center pt-[var(--safe-top)] pb-[calc(var(--safe-bottom)+140px)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Header
        showBack
        showClose
        onCloseClick={() => {
          if (isDirty) {
            setIsLogConfirmOpen(true);
            return;
          }

          goBack();
        }}
      />
      {isLogConfirmOpen && (
        <ConfirmModal
          message={
            "해당 기록은 저장되지 않습니다.\n저장하지 않고 나가시겠습니까?"
          }
          onClose={() => setIsLogConfirmOpen(false)}
          onConfirm={() => {
            discardChanges();
            goBack();
          }}
        />
      )}

      <section className="flex flex-col mt-5 items-center">
        <LogPreviewCard />

        <div className="flex flex-col w-[360px] items-start justify-center gap-4 mt-5">
          <p className="text-subtitle font-semibold text-gray-100 leading-[1.4] tracking-[-0.025em]">
            공개 범위 설정
          </p>
          <VisibilityCard
            type="private"
            selected={draft.visibility === "private"}
            onClick={() => setVisibility("private")}
          />
          <VisibilityCard
            type="public"
            selected={draft.visibility === "public"}
            onClick={() => setVisibility("public")}
          />
        </div>

        <div className="flex items-center justify-center pt-10">
          <p className="text-body-02 text-gray-60 leading-[1.4] tracking-[-0.025em] text-center">
            공유한 장소 후기와 사진은 {stationName} 코스와 장소 상세화면에서 다른 사용자에게
            <br />
            보여질 수 있어요. 공개 범위는 언제든 변경 가능해요.
          </p>
        </div>
      </section>

      <section className="fixed inset-x-0 bottom-[calc(var(--safe-bottom)+10px)] z-10 flex items-center justify-center">
        <CTAButton disabled={isSubmitting} onClick={() => void handleSave()}>
          저장하기
        </CTAButton>
      </section>
    </main>
  );
}
export default LogVisibilityPage;
