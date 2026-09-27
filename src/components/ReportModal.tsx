import { useState, type ComponentPropsWithoutRef } from "react";
import { type ReportMode } from "./ReportReasonModal";
import ConfirmModal from "./ConfirmModal";
import SuccessModal from "./SuccessModal";
import ReportReasonModal from "./ReportReasonModal";
import { postBlockedUser, MemberAlreadyBlockedError } from "@/api/block";
import { showToast } from "@/pages/course/components/ShowToast";
import type { ReportTargetType } from "@/types/report";

interface ReportModalProps extends ComponentPropsWithoutRef<"div"> {
  mode: ReportMode;
  reportTarget: string;
  targetMemberId: number;
  targetType: ReportTargetType;
  targetId: number;
  onClose: () => void;
  onBlock?: () => void;
}

type ReportModalStep =
  | "menu"
  | "reportReason"
  | "blockConfirm"
  | "blockSuccess";

export default function ReportModal({
  mode,
  reportTarget,
  targetMemberId,
  targetType,
  targetId,
  onClose,
  onBlock,
}: ReportModalProps) {
  const [step, setStep] = useState<ReportModalStep>("menu");

  const handleBlockConfirm = async () => {
    try {
      await postBlockedUser(targetMemberId);
      onBlock?.();
      setStep("blockSuccess");
    } catch (e) {
      console.error(e);

      if (e instanceof MemberAlreadyBlockedError) {
        showToast({ message: "이미 차단한 사용자예요." });
        onClose();
        return;
      }

      showToast({ message: "사용자 차단에 실패했어요." });
    }
  };

  if (step === "reportReason") {
    return (
      <ReportReasonModal
        mode={mode}
        targetType={targetType}
        targetId={targetId}
        onClose={onClose}
      />
    );
  }

  if (step === "blockConfirm") {
    return (
      <ConfirmModal
        message="이 사용자를 차단할까요?"
        subtitle={`차단하면 이 사용자가 작성한 여행일지와\n장소 리뷰가 더이상 표시되지 않습니다.`}
        leftButtonText="취소"
        rightButtonText="차단하기"
        onClose={onClose}
        onConfirm={handleBlockConfirm}
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
          className="flex w-full items-center justify-center py-3 h-15 rounded-lg bg-gray-20 text-title-02 font-semibold leading-1.4 tracking-[-0.45px] text-gray-90 outline-none transition-colors active:bg-gray-40"
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
