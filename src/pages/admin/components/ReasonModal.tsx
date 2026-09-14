import Warning from "@/assets/warning.svg?react";
import ModalButton from "@/components/ModalButton";
import type { ComponentPropsWithoutRef } from "react";

type modeType = "rejected" | "deleted";

interface ReasonModalProps extends ComponentPropsWithoutRef<"div"> {
  mode: modeType;
  reason: string;
  setReason: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ReasonModal({
  mode = "rejected",
  reason,
  setReason,
  onClose,
  onConfirm,
}: ReasonModalProps) {
  const isRejected = mode === "rejected";

  return (
    // 모달 외부 영역
    <div
      role="presentation"
      className="fixed inset-0 z-99 flex w-full h-full items-center justify-center bg-black/30"
    >
      {/* 모달 영역 */}
      <section
        role="dialog"
        className="flex relative flex-col gap-4 w-[340px] items-center bg-white px-4 pt-8 pb-6 rounded-lg"
      >
        <Warning className="w-12 h-12" />
        <p className="text-title-02 font-semibold text-center whitespace-pre-line leading-[1.4] tracking-[-0.45px]">
          {isRejected
            ? "해당 장소를 반려하는\n이유를 작성해주세요."
            : "해당 장소를 삭제하는\n이유를 작성해주세요."}
        </p>
        <textarea
          placeholder={isRejected ? "반려 이유 작성하기" : "삭제 이유 작성하기"}
          value={reason}
          className="flex p-4 rounded-lg min-h-[100px] min-w-[302px] resize-none bg-gray-10 text-gray-90 text-body-02 leading-[1.4] tracking-[-0.3px] placeholder:text-gray-60 outline-none"
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-2">
          <ModalButton variant="secondary" onClick={onClose}>
            취소
          </ModalButton>
          <ModalButton variant="primary" onClick={onConfirm}>
            확인
          </ModalButton>
        </div>
      </section>
    </div>
  );
}
