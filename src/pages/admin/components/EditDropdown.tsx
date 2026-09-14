import { useState } from "react";
import ArrowDownPrimary from "@/assets/admin/arrow-down(primary).svg?react";
import ArrowDownSecondary from "@/assets/admin/arrow-down(secondary).svg?react";
import LineBadge from "@/components/LineBadge";
import type { SubwayLine } from "@/types/subway";

export type EditDropdownVariant = "primary" | "secondary";
export type EditDropdownMode = "default" | "tag";
export type EditDropdownRenderOption = "default" | "line";

type Option = {
  label: string;
  value: string;
};

type EditDropdownProps = {
  variant?: EditDropdownVariant;
  mode?: EditDropdownMode;
  options: Option[];
  value: string;
  onSelect?: (value: string) => void;
  disabledValues?: string[];
  placeholder?: string;
  renderOption?: EditDropdownRenderOption;
};

const variantStyles: Record<EditDropdownVariant, string> = {
  primary: `bg-secondary-20 border-secondary-40 text-primary-80`,
  secondary: `bg-gray-20 border-gray-40 text-gray-70`,
};

export default function EditDropdown({
  variant = "primary",
  mode = "default",
  options,
  value,
  onSelect,
  disabledValues,
  placeholder,
  renderOption = "default",
}: EditDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption =
    options.find((option) => option.value === value) ?? null;

  const toggleDropdown = () => {
    if (options.length === 0) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (option: Option) => {
    if (disabledValues?.includes(option.value)) return;
    setIsOpen(false);
    if (onSelect) onSelect(option.value);
  };

  return (
    <div className="relative text-body-01">
      <button
        type="button"
        className={`${variantStyles[variant]} inline-flex items-end px-4 py-2 gap-1 rounded-lg border focus:outline-none`}
        onClick={toggleDropdown}
      >
        <span className="text-body-01 leading-[1.4] tracking-[-0.35px]">
          {selectedOption
            ? mode === "tag"
              ? `#${selectedOption.label}`
              : selectedOption.label
            : placeholder}
        </span>
        {variant === "primary" ? (
          <ArrowDownPrimary
            className={`flex w-5 h-5 items-center justify-center ${isOpen ? "rotate-180" : ""}`}
          />
        ) : (
          <ArrowDownSecondary
            className={`flex w-5 h-5 items-center justify-center ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {isOpen && options.length > 0 && (
        <ul className="absolute top-full left-0 z-10 flex flex-col mt-2 px-5 py-4 gap-3 rounded-lg border border-white bg-white shadow-[0_0_28px_0_rgba(118,118,118,0.25)] w-max">
          {options.map((option, index) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`${disabledValues?.includes(option.value) ? "text-gray-40" : "text-gray-70"} text-body-01 font-semibold leading-[1.4] tracking-[-0.35px]`}
            >
              {renderOption === "line" ? (
                <div className="flex gap-1">
                  <LineBadge line={(index + 1) as SubwayLine} />
                  {option.label}
                </div>
              ) : (
                option.label
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
