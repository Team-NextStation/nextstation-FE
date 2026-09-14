import { useNavigate } from "react-router-dom";
import BackIcon from "@/assets/back.svg?react";
import PlacePreviewCard from "./components/PlacePreviewCard";
import { useMemo, useState } from "react";
import { mockPlaces } from "./data/mockPlaces";

const CATEGORY_STYLE_LABELS: Record<string, string> = {
  CULTURE: "문화공간",
  CAFE: "카페",
  FOOD: "식당",
  WALK: "산책포인트",
};

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleBackClick = () => {
    navigate(-1);
  };

  const results = useMemo(() => {
    const keyword = query.trim();
    if (!keyword) return mockPlaces;
    return mockPlaces.filter((place) => place.name.includes(keyword));
  }, [query]);

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
          {results.map((place) => (
            <button
              key={place.id}
              type="button"
              className="w-full border-0 bg-transparent p-0 text-left"
              onClick={() => navigate(`/admin/place/${place.id}`)}
            >
              <PlacePreviewCard
                key={place.id}
                name={place.name}
                station={place.station}
                line={place.line}
                imageUrl={place.imageUrl}
                category={CATEGORY_STYLE_LABELS[place.category]}
                tags={place.tags}
                description={place.description}
                status={place.status}
              />
            </button>
          ))}
          {query.trim() && results.length === 0 && (
            <p className="text-center text-body-01 text-gray-70 pt-10">
              검색 결과가 없어요
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
