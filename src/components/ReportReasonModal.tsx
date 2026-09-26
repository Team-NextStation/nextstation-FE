import type { ContentReportReason, ProfileReportReason } from "@/types/report";
import ModalButton from "./ModalButton";
import SuccessModal from "./SuccessModal";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

export type ReportMode = "content" | "profile";

interface ReportReasonModalProps {
  mode: ReportMode;
  onClose: () => void;
}

// reason : 신고 사유 선택 모달 / confirm : 신고 전 확인 모달 / succes : 신고 완료 모달
type ReportStep = "reason" | "confirm" | "success";

const CONTENT_REPORT_REASONS: { value: ContentReportReason; label: string }[] =
  [
    { value: "ABUSIVE_CONTENT", label: "욕설·비방 등 부적절한 콘텐츠" },
    { value: "SPAM_AD", label: "스팸·광고성 콘텐츠" },
    { value: "HATE_OR_OFFENSIVE", label: "혐오·불쾌감을 주는 콘텐츠" },
    { value: "IRRELEVANT", label: "서비스와 관련 없는 콘텐츠" },
  ];

const PROFILE_REPORT_REASONS: { value: ProfileReportReason; label: string }[] =
  [
    { value: "ABUSIVE", label: "욕설·비방 괴롭힘" },
    { value: "SPAM", label: "스팸·광고 활동" },
    { value: "IMPERSONATION", label: "사칭·허위 계정" },
    { value: "INAPPROPRIATE_PROFILE", label: "부적절한 프로필" },
  ];

export default function ReportReasonModal({
  mode,
  onClose,
}: ReportReasonModalProps) {
  const isContentMode = mode === "content";
  const [selectedReason, setSelectedReason] = useState<
    ContentReportReason | ProfileReportReason | null
  >(null);
  const [step, setStep] = useState<ReportStep>("reason");

  if (step === "success") {
    return (
      <SuccessModal
        message="신고되었어요"
        subtitle={`더 나은 환승여행을 위해 신고해주셔서 감사해요.\n보내주신 내용은 확인 후 필요한 조치를 진행할게요.`}
        onClose={onClose}
      />
    );
  }

  if (step === "confirm" && mode === "content" && selectedReason) {
    const reasonLabel =
      CONTENT_REPORT_REASONS.find((item) => item.value === selectedReason)
        ?.label ?? "";

    return (
      <ConfirmModal
        message={`${reasonLabel}예요`}
        leftButtonText="취소"
        rightButtonText="신고하기"
        onClose={onClose}
        onConfirm={() => setStep("success")}
      />
    );
  }

  if (step === "confirm" && mode === "profile" && selectedReason) {
    const reasonLabel =
      PROFILE_REPORT_REASONS.find((item) => item.value === selectedReason)
        ?.label ?? "";

    return (
      <ConfirmModal
        message="이 사용자를 신고할까요?"
        subtitle={`신고 이유: ${reasonLabel}`}
        leftButtonText="취소"
        rightButtonText="신고하기"
        onClose={onClose}
        onConfirm={() => setStep("success")}
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
        className="flex relative flex-col gap-4 w-[360px] items-center bg-white px-4 pt-8 pb-6 rounded-lg"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-title-02 font-semibold leading-1.4 trakcing-[-0.45px] text-gray-100">
            {isContentMode ? "콘텐츠 신고" : "사용자 신고"}
          </span>
          <p className="text-body-01 leading-1.4 trakcing-[-0.35px] text-gray-50">
            신고하는 이유를 선택해주세요.
          </p>
        </div>

        <div className="flex flex-col justify-start self-start gap-2.5">
          {isContentMode
            ? CONTENT_REPORT_REASONS.map((item) => (
                <label
                  key={item.value}
                  className="flex items-start pl-2 gap-2.5"
                >
                  <div className="relative w-[30px] h-[30px]">
                    <input
                      type="radio"
                      name="report-reason"
                      value={item.value}
                      checked={selectedReason === item.value}
                      onChange={() => setSelectedReason(item.value)}
                      className="peer sr-only"
                    />
                    <div className="absolute inset-0 rounded-full border border-gray-40 transition-colors peer-checked:border-primary-50" />
                    <div className="absolute inset-[4px] rounded-full bg-transparent peer-checked:bg-primary-50 transition-all" />
                  </div>
                  <span className="text-subtitle leading-1.4 tracking-[-0.4px] text-gray-100">
                    {item.label}
                  </span>
                </label>
              ))
            : PROFILE_REPORT_REASONS.map((item) => (
                <label
                  key={item.value}
                  className="flex items-start pl-2 gap-2.5"
                >
                  <div className="relative w-[30px] h-[30px]">
                    <input
                      type="radio"
                      name="report-reason"
                      value={item.value}
                      checked={selectedReason === item.value}
                      onChange={() => setSelectedReason(item.value)}
                      className="peer sr-only"
                    />
                    <div className="absolute inset-0 rounded-full border border-gray-40 transition-colors peer-checked:border-primary-50" />
                    <div className="absolute inset-[4px] rounded-full bg-transparent peer-checked:bg-primary-50 transition-all" />
                  </div>
                  <span className="text-subtitle leading-1.4 tracking-[-0.4px] text-gray-100">
                    {item.label}
                  </span>
                </label>
              ))}
        </div>

        <div className="flex w-full justify-between pt-2">
          <ModalButton variant="secondary" onClick={onClose} width={160}>
            취소
          </ModalButton>
          <ModalButton
            variant={selectedReason ? "primary" : "secondary"}
            width={160}
            disabled={!selectedReason}
            onClick={() => setStep("confirm")}
          >
            신고하기
          </ModalButton>
        </div>
      </section>
    </div>
  );
}
