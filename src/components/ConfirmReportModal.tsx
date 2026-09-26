import WarningIcon from "@/assets/warning.svg?react";
import ModalButton from "./ModalButton";

interface ConfirmReportModalProps {
  reasonLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmReportModal({
  reasonLabel,
  onClose,
  onConfirm,
}: ConfirmReportModalProps) {
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
        <WarningIcon />
        <p className="text-title-02 font-semibold leading-1.4 tracking-[-0.45px] text-gray-100">
          {reasonLabel}예요
        </p>
        <div className="flex w-full justify-between">
          <ModalButton variant="secondary" onClick={onClose}>
            취소
          </ModalButton>
          <ModalButton variant="primary" onClick={onConfirm}>
            신고하기
          </ModalButton>
        </div>
      </section>
    </div>
  );
}
