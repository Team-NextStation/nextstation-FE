export type StatusChipVariant = "approved" | "pending" | "rejected" | "deleted";
export type StatusChipMode = "card" | "page";

interface StatusChipProps {
  variant?: StatusChipVariant;
  mode?: StatusChipMode;
}

const contentMapping: Record<StatusChipVariant, string> = {
  approved: "등록",
  pending: "대기",
  rejected: "반려",
  deleted: "삭제",
};

const variantStyles: Record<StatusChipVariant, string> = {
  approved: `bg-subway-2-dark text-white`,
  pending: `bg-gray-30 text-gray-90`,
  rejected: `bg-[#FF9135] text-white`,
  deleted: `bg-[#F54900] text-white`,
};

const modeStyles: Record<StatusChipMode, string> = {
  card: "text-caption",
  page: "text-body-01",
};

export default function StatusChip({
  variant = "approved",
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
