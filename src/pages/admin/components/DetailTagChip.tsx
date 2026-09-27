export type DetailTagChipVariant = "primary" | "secondary";

type DetailTagChipProps = {
  variant?: DetailTagChipVariant;
  content: string;
};

const variantStyles: Record<DetailTagChipVariant, string> = {
  primary: `bg-secondary-20 border-secondary-40 text-primary-80`,
  secondary: `bg-gray-20 border-gray-40 text-gray-70`,
};

export default function DetailTagChip({
  variant = "primary",
  content,
}: DetailTagChipProps) {
  return (
    <span
      className={`${variantStyles[variant]} flex w-fit px-4 py-2 items-center justify-center bg-gray-20 border border-gray-40 rounded-lg text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-70`}
    >
      {content}
    </span>
  );
}
