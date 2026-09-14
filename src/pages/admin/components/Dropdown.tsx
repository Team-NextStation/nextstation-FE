import { useState } from "react";
import ArrowDown from "@/assets/arrow-down.svg?react";

type Option = {
  label: string;
  value: string;
};

type DropdownProps = {
  options: Option[];
  value: string;
  onSelect?: (value: string) => void;
};

export default function Dropdown({ options, value, onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption =
    options.find((option) => option.value === value) ?? null;

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (option: Option) => {
    setIsOpen(false);
    if (onSelect) onSelect(option.value);
  };

  return (
    <div className="relative text-body-01">
      <button
        type="button"
        className="inline-flex items-end px-5 py-2 gap-3 rounded-lg border border-white bg-white/50 focus:outline-none"
        onClick={toggleDropdown}
      >
        <span className="text-gray-70 text-body-01 font-semibold leading-[1.4] tracking-[-0.35px]">
          {selectedOption?.label}
        </span>
        <ArrowDown
          className={`flex w-5 h-5 items-center justify-center ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <ul className="absolute top-full left-0 z-10 flex flex-col mt-2 w-[108px] px-5 py-4 gap-3 rounded-lg border border-white bg-white shadow-[0_0_28px_0_rgba(118,118,118,0.25)]">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className="text-gray-70 text-body-01 font-semibold leading-[1.4] tracking-[-0.35px]"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
