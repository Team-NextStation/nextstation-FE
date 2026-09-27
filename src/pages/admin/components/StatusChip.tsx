export type StatusChipVariant = "APPROVED" | "PENDING" | "REJECTED" | "DELETED";
export type StatusChipMode = "card" | "page";

interface StatusChipProps {
  variant?: StatusChipVariant;
  mode?: StatusChipMode;
}

const contentMapping: Record<StatusChipVariant, string> = {
  APPROVED: "등록",
  PENDING: "대기",
  REJECTED: "반려",
  DELETED: "삭제",
};

const variantStyles: Record<StatusChipVariant, string> = {
  APPROVED: `bg-subway-2-dark text-white`,
  PENDING: `bg-gray-30 text-gray-90`,
  REJECTED: `bg-[#FF9135] text-white`,
  DELETED: `bg-[#F54900] text-white`,
};

const modeStyles: Record<StatusChipMode, string> = {
  card: "text-caption",
  page: "text-body-01",
};

export default function StatusChip({
  variant = "APPROVED",
  mode = "card",
}: StatusChipProps) {
  return (
    <span
      className={`${variantStyles[variant]} ${modeStyles[mode]} flex w-fit px-2 py-1 rounded-lg items-center justify-center leading-normal tracking-[-0.25px]`}
    >
      {contentMapping[variant]}
    </span>
  );
}
