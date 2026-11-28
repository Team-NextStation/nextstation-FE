import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import CTAButton from "@/components/CTAButton";
import ConfirmModal from "@/components/ConfirmModal";
import NameEditInput from "./components/NameEditInput";
import PlaceReviewCard from "./components/PlaceReviewCard";
import { useLogDraft } from "./contexts/LogDraftContext";
import { useBackNavigation } from "@/hooks/useBackNavigation";

function LogPlacePage() {
  const navigate = useNavigate();
  const goBack = useBackNavigation("/course", { registerSwipe: false });
  const { courseId } = useParams();
  const { draft, setLogName, updatePlaceReview, isDirty } = useLogDraft();

  const [isLogConfirmOpen, setIsLogConfirmOpen] = useState(false);

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

          navigate("/course");
        }}
      />
      {isLogConfirmOpen && (
        <ConfirmModal 
          message={"해당 기록은 저장되지 않았습니다.\n저장하지 않고 나가시겠습니까?"}
          onClose={() => setIsLogConfirmOpen(false)} 
          onConfirm={goBack}
        />
      )}

      <section className="flex flex-col w-[390px] p-5">
        <NameEditInput value={draft.logName} onChange={setLogName} className="border-none"/>
      </section>

      <section className="flex flex-col w-[360px] gap-4">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center justify-center gap-1">
            <p className="text-subtitle font-semibold text-gray-100 leading-[1.4] tracking-[-0.025em]">
              다녀온 장소 후기
            </p>
            <p className="text-body-01 text-gray-50 leading-[1.4] tracking-[-0.025em]">
              (선택)
            </p>
          </div>
          <p className="text-body-02 text-gray-70 leading-[1.4] tracking-[-0.025em]">
            장소를 선택하고, 짧은 후기와 사진을 남겨보세요.
          </p>
        </div>
        <div className="flex flex-col gap-4">
            {draft.placeReviews.map((place) => (
              <PlaceReviewCard
                key={place.id}
                id={place.id}
                label={place.label}
                review={place.review}
                photo={place.photo}
                onChangeReview={(value) =>
                  updatePlaceReview(place.id, { review: value })
                }
                onChangePhoto={(value) =>
                  updatePlaceReview(place.id, { photo: value })
                }
              />
            ))}
        </div>
        
      </section>

      <section className="fixed inset-x-0 bottom-[calc(var(--safe-bottom)+10px)] z-10 flex items-center justify-center">
        <CTAButton onClick={() => navigate(`/course/${courseId}/log/visibility`)}>
          다음
        </CTAButton>
      </section>
    </main>
  )
}
export default LogPlacePage
