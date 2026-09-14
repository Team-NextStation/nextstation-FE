import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BackIcon from "@/assets/back.svg?react";
import PlaceDetailContent from "./components/PlaceDetailContent";
import StatusChip from "./components/StatusChip";
import CTAButton from "@/components/CTAButton";
import ConfirmModal from "@/components/ConfirmModal";
import {
  getPlaceDetail,
  patchPlaceStatus,
  type placeDetail,
} from "@/api/admin";

// 휴지통으로부터 진입

export default function TrashDetailPage() {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const [place, setPlace] = useState<placeDetail>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isRejected = place?.status === "REJECTED";

  useEffect(() => {
    const fetchPlaceDetail = async () => {
      try {
        const data = await getPlaceDetail(Number(placeId));
        setPlace(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPlaceDetail();
  }, [placeId]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (!place) {
    return (
      <main className="flex h-dvh items-center justify-center bg-gray-10">
        <p className="text-body-01 text-gray-70">장소를 찾을 수 없어요.</p>
      </main>
    );
  }

  const handlePending = async () => {
    // 복구하기 --> PENDING
    await patchPlaceStatus(Number(placeId), "PENDING");
    navigate(-1);
  };

  return (
    <main className="flex flex-col h-dvh  bg-gray-10 pt-[calc(var(--safe-top)+12px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* TODO : onConfirm 추후 수정 */}
      {isModalOpen && (
        <ConfirmModal
          message="해당 장소 데이터를 복구하시겠습니까?"
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            setIsModalOpen(false);
            handlePending();
          }}
        />
      )}

      {/* header */}
      <header className="flex w-full h-6 items-center px-[15px] pb-2.5">
        <button
          type="button"
          onClick={handleBackClick}
          aria-label="뒤로가기"
          className="flex size-6 items-center justify-center outline-none"
        >
          <BackIcon className="size-6" />
        </button>
      </header>

      {/* content */}
      <section className="flex justify-center py-5">
        <div className="flex flex-col gap-2.5 w-[360px]">
          <div className="flex flex-col gap-2.5 justify-start">
            <StatusChip mode="page" variant={place.status} />
            <div className="flex flex-col gap-2.5 bg-white rounded-lg p-4">
              <span className="text-body-02 font-semibold leading-[1.4] tracking-[-0.3px] text-gray-60">
                {isRejected ? "반려 사유" : "삭제 사유"}
              </span>
              <p className="text-body-02 leading-[1.4] tracking-[-0.3px] text-gray-60">
                {isRejected ? place.rejectReason : place.deleteReason}
              </p>
            </div>
          </div>

          <PlaceDetailContent place={place} />

          <section className="fixed inset-x-0 bottom-[calc(var(--safe-bottom)+10px)] z-10 flex items-center justify-center">
            <CTAButton onClick={() => setIsModalOpen(true)}>복구하기</CTAButton>
          </section>
        </div>
      </section>
    </main>
  );
}
