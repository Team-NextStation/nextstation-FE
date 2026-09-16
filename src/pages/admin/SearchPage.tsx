import { useNavigate } from "react-router-dom";
import BackIcon from "@/assets/back.svg?react";
import PlacePreviewCard from "./components/PlacePreviewCard";
import { useEffect, useState } from "react";
import { getSearchPlaces, type Place } from "@/api/admin";

const CATEGORY_STYLE_LABELS: Record<string, string> = {
  CULTURE: "문화공간",
  CAFE: "카페",
  FOOD: "식당",
  WALK: "산책포인트",
};

interface SearchResultState {
  keyword: string;
  results: Place[];
  error: string | null;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  // 마지막으로 응답이 온 검색어와 그 결과를 같이 저장
  const [searchResult, setSearchResult] = useState<SearchResultState | null>(
    null,
  );
  const keyword = query.trim();

  // 디바운스
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const handleBackClick = () => {
    navigate(-1);
  };

  // keyword가 변경되고 500ms 뒤에 debouncedKeyword를 갱신
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [keyword]);

  // debouncedKeyword가 바뀔 때만 실제로 검색 API 호출
  useEffect(() => {
    if (!debouncedKeyword) return;

    let isCancelled = false;

    const fetchSearchResults = async () => {
      try {
        const data = await getSearchPlaces(debouncedKeyword);

        if (isCancelled) return;
        setSearchResult({
          keyword: debouncedKeyword,
          results: data.places,
          error: null,
        });
      } catch (e) {
        if (isCancelled) return;
        console.error(e);
        setSearchResult({
          keyword: debouncedKeyword,
          results: [],
          error: "장소 검색 결과를 불러오지 못했습니다.",
        });
      }
    };

    fetchSearchResults();

    return () => {
      isCancelled = true;
    };
  }, [debouncedKeyword]);

  const hasFreshResult =
    debouncedKeyword !== "" && searchResult?.keyword === debouncedKeyword;
  const displayedResults = hasFreshResult ? searchResult.results : [];
  const displayedError = hasFreshResult ? searchResult.error : null;

  if (displayedError) return <p>{displayedError}</p>;

  return (
    <main className="flex flex-col h-dvh gap-[17px] bg-gray-10 pt-[calc(var(--safe-top)+12px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* header */}
      <header className="flex w-full items-center px-3 gap-4 pb-2.5">
        <div className="flex items-center justify-start">
          <button
            type="button"
            onClick={handleBackClick}
            aria-label="뒤로가기"
            className="flex size-6 items-center justify-center outline-none"
          >
            <BackIcon className="size-6" />
          </button>
        </div>

        <input
          className="flex-1 px-4 py-3 rounded-lg border border-gray-30 bg-gray-20 text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-90 outline-none caret-primary-50"
          placeholder="장소명 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      {/* result */}
      <section className="flex justify-center">
        <div className="flex flex-col gap-2 w-[360px]">
          {displayedResults.map((place) => (
            <button
              key={place.placeId}
              type="button"
              className="w-full border-0 bg-transparent p-0 text-left"
              onClick={() => navigate(`/admin/place/${place.placeId}`)}
            >
              <PlacePreviewCard
                key={place.placeId}
                name={place.placeName}
                station={place.representativeLine.name}
                line={place.representativeLine}
                imageUrl={place.imageUrl}
                category={CATEGORY_STYLE_LABELS[place.categoryCode]}
                tags={place.tags}
                description={place.description}
                status={place.status}
              />
            </button>
          ))}
          {hasFreshResult && displayedResults.length === 0 && (
            <p className="text-center text-body-01 text-gray-70 pt-10">
              검색 결과가 없어요
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
