import { useState, type ChangeEventHandler } from "react";
import SearchIcon from "@/assets/search.svg?react";

interface ExploreSearchBarProps {
  ariaLabel?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onSubmit: (query: string) => void;
  placeholder?: string;
  value?: string;
}

export default function ExploreSearchBar({
  ariaLabel = "코스 검색",
  defaultValue,
  onChange,
  onSubmit,
  placeholder,
  value,
}: ExploreSearchBarProps) {
  const [uncontrolledQuery, setUncontrolledQuery] = useState(
    defaultValue ?? "",
  );
  const currentQuery = value ?? uncontrolledQuery;

  return (
    <form
      className="flex h-12 w-full items-center gap-2 rounded-lg border border-gray-40 bg-gray-20 p-3 text-gray-70 focus-within:border-primary-50 focus-within:bg-white"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onSubmit(String(formData.get("query") ?? "").trim());
      }}
    >
      {!currentQuery && (
        <SearchIcon className="size-5 shrink-0" aria-hidden="true" />
      )}
      <input
        className="min-w-0 flex-1 border-0 bg-transparent text-subtitle text-gray-90 outline-none"
        aria-label={ariaLabel}
        defaultValue={defaultValue}
        name="query"
        onChange={(event) => {
          if (value === undefined) setUncontrolledQuery(event.target.value);
          onChange?.(event);
        }}
        placeholder={placeholder}
        value={value}
      />
    </form>
  );
}
