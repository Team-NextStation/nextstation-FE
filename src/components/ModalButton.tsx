import type { ButtonHTMLAttributes, ReactNode } from "react";

type ModalButtonVariant = "primary" | "secondary";

interface ModalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ModalButtonVariant;
  width?: number;
}

const variantStyles: Record<ModalButtonVariant, string> = {
  primary: `
    bg-linear-to-r from-secondary-50 to-primary-50
    border border-secondary-40 text-white`,
  secondary: `
    bg-gray-20 border border-gray-40 text-gray-60`,
};

export default function ModalButton({
  children,
  variant = "primary",
  className = "",
  width = 150,
  ...props
}: ModalButtonProps) {
  return (
    <button
      type="button"
      className={`
        flex h-[50px] items-center justify-center rounded-lg py-3 outline-none
        ${variantStyles[variant]}
        ${className}
        
      `}
      style={{ width }}
      {...props}
    >
      <span className="whitespace-nowrap text-title-02 font-semibold leading-[1.4] tracking-[-0.45px]">
        {children}
      </span>
    </button>
  );
}
