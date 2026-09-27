import CTAButton from "./CTAButton";
import CheckIcon from "@/assets/check.svg?react";

interface SuccessModalProps {
  message: string;
  subtitle?: string;
  onClose: () => void;
}

export default function SuccessModal({
  message,
  subtitle,
  onClose,
}: SuccessModalProps) {
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
        <div className="flex flex-col items-center gap-2.5">
          <CheckIcon />
          <div className="flex flex-col items-center gap-2">
            <p className="text-title-02 font-semibold leading-1.4 tracking-[-0.45px] text-gray-100">
              {message}
            </p>
            {subtitle && (
              <p className="whitespace-pre-line text-center text-body-02 leading-[1.4] tracking-[-0.3px] text-gray-60">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <CTAButton width={300} onClick={onClose}>
          닫기
        </CTAButton>
      </section>
    </div>
  );
}
