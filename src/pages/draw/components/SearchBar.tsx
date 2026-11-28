import { useEffect, useState, useRef } from "react";
import SearchIcon from '@/assets/search.svg?react';
import CloseIcon from '@/assets/close.svg?react';
import LineBadge from "./LineBadge";
import { searchStations, type Station } from "@/api/stations";
interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  selectedStation: Station | null;
  onSelectStation: (station: Station | null ) => void;
}

export default function SearchBar({ 
  query,
  onQueryChange,
  selectedStation,
  onSelectStation
}: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  useEffect(() => {
    if (trimmedQuery.length < 1) {
      return;
    }

    const controller = new AbortController();
    const currentRequestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const mapped = await searchStations(trimmedQuery, controller.signal);

        if (requestIdRef.current !== currentRequestId) return;
        setSuggestions(mapped);
      } catch {
        if (controller.signal.aborted) return;

        setSuggestions([]);
        setError('검색 결과를 불러오지 못했어요.');
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    }
  }, [trimmedQuery]);

  const handleSelectStation = (station: Station) => {
    onQueryChange(station.name)
    onSelectStation(station);
  }

  const handleInputChange = (value: string) => {
    setSuggestions([]);
    setError(null);
    setIsLoading(false);
    onQueryChange(value);
    onSelectStation(null);
  };

  const handleClear = () => {
    setSuggestions([]);
    setError(null);
    setIsLoading(false);
    onQueryChange('');
    onSelectStation(null);
  }

  const visibleSuggestions = hasQuery ? suggestions : [];
  const visibleError = hasQuery ? error : null;

  const showSuggestions =
    hasQuery &&
    visibleSuggestions.length > 0 &&
    selectedStation?.name !== query;

  const isSelected = selectedStation !== null

  const getLineBadgeValue = (lineName: string) => {
    const match = lineName.match(/^([1-9])호선$/);
    return match ? match[1] : null;
  };

  return (
    <div className={[
        "relative w-[360px] rounded-lg"
      ].join("")}
    >
      <div className="relative z-10">
        <div className={[
            "flex h-[50px] w-full items-center justify-between rounded-[20px] px-4 py-3",
            isSelected
              ? "border border-primary-50 bg-white"
              : showSuggestions
              ? "border border-primary-50 bg-white"
              : "border border-transparent bg-gray-20 focus-within:border-primary-50 focus-within:bg-white"
          ].join(" ")}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {isSelected && (
              <div className="flex shrink-0 items-center gap-1">
                {selectedStation.lines.map((line) => {
                  const badgeLine = getLineBadgeValue(line.name);

                  if (!badgeLine) return null;
                 return (
                  <LineBadge
                    key={`${selectedStation.id}-${line.code}`}
                    line={badgeLine}
                  />
                );
                })}
              </div>
            )}

            <input
              value={query}
              onChange={(e) => {
                handleInputChange(e.target.value);
              }}
              placeholder="나와 가장 가까운 지하철역 찾아보기"
              className={[
                "min-w-0 flex-1 bg-transparent outline-none text-subtitle leading-[1.4] tracking-[-0.025em]",
                isSelected ? "text-gray-100" : "text-gray-70"
              ].join(" ")}
            />
          </div>

          {query.length > 0 ? (
            <button
              type="button"
              onClick={handleClear}
              className="ml-3 flex shrink-0 items-center justify-center"
              aria-label="검색어 지우기"
            >
              <CloseIcon className="size-6" />
            </button>
          ) : (
            <div className="ml-3 flex shrink-0 items-center justify-center">
              <SearchIcon className="size-6" />
            </div>
          )}
        </div>
      </div>

      {showSuggestions && (
        <ul className="absolute inset-x-0 top-[calc(100%-20px)] max-h-[280px] z-0 rounded-b-[20px] bg-white pt-[20px] pb-2 shadow-[0_0_28px_0_rgba(118,118,118,0.25)] overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {visibleSuggestions.map((station) => (
            <li key={station.id}>
              <button
                type="button"
                onClick={() => handleSelectStation(station)}
                className="flex w-full items-center gap-1 p-4 text-left"
              >
                <div className="flex items-center gap-1">
                  {station.lines.map((line) => {
                    const badgeLine = getLineBadgeValue(line.name);

                    if (!badgeLine) return null;

                    return (
                      <LineBadge
                        key={`${station.id}-${line.code}`}
                        line={badgeLine}
                      />
                    );
                  })}
                </div>
                <span className="text-body-01 text-gray-100 leading-[1.4] tracking-[-0.025em]">
                  {station.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hasQuery && !isLoading && !showSuggestions && visibleError && (
        <div className="absolute inset-x-0 top-[calc(100%-20px)] z-0 rounded-b-[20px] bg-white px-4 pt-[20px] pb-4 shadow-[0_0_28px_0_rgba(118,118,118,0.25)]">
          <p className="text-body-02 text-gray-60 leading-[1.4] tracking-[-0.025em]">
            {visibleError}
          </p>
        </div>
      )}
    </div>
  )
}
