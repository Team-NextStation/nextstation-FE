import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BackIcon from "@/assets/back.svg?react";
import More from "@/assets/like/more.svg?react";

import PlaceDetailContent from "./components/PlaceDetailContent";
import StatusChip from "./components/StatusChip";
import ModalButton from "@/components/ModalButton";
import ReasonModal from "./components/ReasonModal";
import {
  getPlaceDetail,
  patchPlaceStatus,
  type placeDetail,
} from "@/api/admin";

// 장소로부터 진입

export default function PlaceDetailPage() {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const [place, setPlace] = useState<placeDetail>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isPending = place?.status === "PENDING";
  const [isRejectedModalOpen, setIsRejectedModalOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [reason, setReason] = useState("");

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

  if (!place) {
    return (
      <main className="flex h-dvh items-center justify-center bg-gray-10">
        <p className="text-body-01 text-gray-70">장소를 찾을 수 없어요.</p>
      </main>
    );
  }

  const refreshPlace = async () => {
    const data = await getPlaceDetail(Number(placeId));
    setPlace(data);
  };

  // 승인
  const handleApproved = async () => {
    await patchPlaceStatus(Number(placeId), "APPROVED");
    await refreshPlace();
  };

  // 반려
  const handleRejected = async () => {
    await patchPlaceStatus(Number(placeId), "REJECTED", reason);
    setIsRejectedModalOpen(false);
    navigate("/admin/place");
  };

  // 삭제
  const handleDeleted = async () => {
    await patchPlaceStatus(Number(placeId), "DELETED", reason);
    setIsDeletedModalOpen(false);
    navigate("/admin/place");
  };

  return (
    <main className="flex flex-col h-dvh  bg-gray-10 pt-[calc(var(--safe-top)+12px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {isRejectedModalOpen && (
        <ReasonModal
          mode="rejected"
          reason={reason}
          setReason={setReason}
          onClose={() => {
            setIsRejectedModalOpen(false);
            setReason("");
          }}
          onConfirm={handleRejected}
        />
      )}
      {isDeletedModalOpen && (
        <ReasonModal
          mode="deleted"
          reason={reason}
          setReason={setReason}
          onClose={() => {
            setIsDeletedModalOpen(false);
            setReason("");
          }}
          onConfirm={handleDeleted}
        />
      )}

      {/* header */}
      <header className="relative flex w-full h-6 items-center px-[15px] justify-between pb-2.5">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate("/admin/place")}
            aria-label="뒤로가기"
            className="flex size-6 items-center justify-center outline-none"
          >
            <BackIcon className="size-6" />
          </button>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            aria-label="더보기"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex size-6 items-center justify-center outline-none"
          >
            <More className="size-6" />
          </button>
        </div>

        {isMenuOpen && (
          <ul className="absolute right-[15px] top-full z-10 mt-2 flex w-[96px] flex-col gap-3 rounded-lg border border-white bg-white/50 px-5 py-4 shadow-[0_0_28px_0_rgba(118,118,118,0.25)]">
            <li>
              <button
                type="button"
                className="text-body-01 font-semibold leading-[1.4] tracking-[-0.35px] text-gray-70"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate(`/admin/place/edit/${placeId}`);
                }}
              >
                수정
              </button>
            </li>
            <li>
              <button
                type="button"
                className="text-body-01 font-semibold leading-[1.4] tracking-[-0.35px] text-gray-70"
                onClick={() => {
                  setIsDeletedModalOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                삭제
              </button>
            </li>
          </ul>
        )}
      </header>

      {/* content */}
      <section className="flex flex-col gap-2.5 items-center py-5">
        <div className="flex w-[360px] justify-start">
          <StatusChip mode="page" variant={place.status} />
        </div>
        <PlaceDetailContent place={place} />
      </section>

      {isPending ? (
        <div className="fixed inset-x-0 bottom-[calc(var(--safe-bottom)+10px)] z-10 flex items-center justify-center">
          <div className="flex w-[360px] justify-between">
            <ModalButton
              variant="secondary"
              width={175}
              onClick={() => setIsRejectedModalOpen(true)}
            >
              반려
            </ModalButton>
            <ModalButton width={175} onClick={handleApproved}>
              승인
            </ModalButton>
          </div>
        </div>
      ) : (
        <></>
      )}
    </main>
  );
}
