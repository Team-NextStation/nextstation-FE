import { useState, type ComponentPropsWithoutRef } from "react";
import { type ReportMode } from "./ReportReasonModal";
import ConfirmModal from "./ConfirmModal";
import SuccessModal from "./SuccessModal";
import ReportReasonModal from "./ReportReasonModal";

interface ReportModalProps extends ComponentPropsWithoutRef<"div"> {
  mode: ReportMode;
  reportTarget: string;
  onClose: () => void;
}

type ReportModalStep =
  | "menu"
  | "reportReason"
  | "blockConfirm"
  | "blockSuccess";

export default function ReportModal({
  mode,
  reportTarget,
  onClose,
}: ReportModalProps) {
  const [step, setStep] = useState<ReportModalStep>("menu");

  if (step === "reportReason") {
    return <ReportReasonModal mode={mode} onClose={onClose} />;
  }

  if (step === "blockConfirm") {
    return (
      <ConfirmModal
        message="이 사용자를 차단할까요?"
        subtitle={`차단하면 이 사용자가 작성한 여행일지와\n장소 리뷰가 더이상 표시되지 않습니다.`}
        leftButtonText="취소"
        rightButtonText="차단하기"
        onClose={onClose}
        onConfirm={() => setStep("blockSuccess")}
      />
    );
  }

  if (step === "blockSuccess") {
    return (
      <SuccessModal
        message="사용자를 차단했습니다"
        subtitle="이 사용자의 콘텐츠는 더이상 표시되지 않습니다."
        onClose={onClose}
      />
    );
  }

  return (
    // 모달 외부 영역
    <div
      role="presentation"
      className="fixed inset-0 z-99 flex w-full h-full items-end pb-10 justify-center bg-black/30"
    >
      {/* 모달 영역 */}
      <section
        role="dialog"
        className="flex relative flex-col gap-2 w-[360px] items-center bg-white px-4 pt-8 pb-6 rounded-lg"
      >
        <button
          className="flex w-full items-center justify-center py-3 h-15 rounded-lg bg-gray-20 text-title-02 font-semibold leading-1.4 trakcing-[-0.45px] text-gray-90 outline-none transition-colors active:bg-gray-40"
          onClick={() => setStep("reportReason")}
        >
          신고하기
        </button>
        <button
          className="flex w-full items-center justify-center py-3 h-15 rounded-lg bg-gray-20 text-title-02 font-semibold leading-1.4 trakcing-[-0.45px] text-gray-90 outline-none transition-colors active:bg-gray-40"
          onClick={() => setStep("blockConfirm")}
        >
          {reportTarget} 님 차단하기
        </button>
        <button
          className="flex w-full items-center justify-center py-3 h-15 rounded-lg bg-white text-title-02 font-semibold leading-1.4 tracking-[-0.45px] text-gray-60 outline-none"
          onClick={onClose}
        >
          닫기
        </button>
      </section>
    </div>
  );
}
