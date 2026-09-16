import Header from "@/components/Header";
import EditDropdown from "./components/EditDropdown";
import { LINES, stationsByLineWithoutAll } from "@/data/stationsByLine";
import { useEffect, useRef, useState } from "react";
import DetailTagChip from "./components/DetailTagChip";
import PlacePhotoUploader from "./components/PlacePhotoUploader";
import CTAButton from "@/components/CTAButton";
import { useNavigate } from "react-router-dom";
import Search from "@/assets/admin/search.svg?react";
import Close from "@/assets/close.svg?react";
import { createPlace, getKakaoSearch, type KakaoPlace } from "@/api/admin";
import { searchStations } from "@/api/stations";
import { showToast } from "@/pages/course/components/ShowToast";

const CATEGORIES = ["문화공간", "식당", "카페", "산책포인트"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_CODES: Record<Category, string> = {
  문화공간: "CULTURE",
  식당: "FOOD",
  카페: "CAFE",
  산책포인트: "WALK",
};

type Option = { label: string; value: string };

const lineOptions: Option[] = LINES.filter((line) => line !== "전체").map(
  (line) => ({ label: line, value: line }),
);

type HastagOption = {
  label: string;
  value:
    | "NATURE"
    | "ALLEY_TRIP"
    | "MARKET"
    | "HOTPLACE"
    | "PHOTO_SPOT"
    | "SHOPPING"
    | "EXPERIENCE"
    | "BUDGET"
    | "INDOOR";
};

const hashtagSortOptions: HastagOption[] = [
  { label: "자연과함께", value: "NATURE" },
  { label: "골목여행", value: "ALLEY_TRIP" },
  { label: "시장구경", value: "MARKET" },
  { label: "핫플레이스", value: "HOTPLACE" },
  { label: "사진찍기좋은", value: "PHOTO_SPOT" },
  { label: "쇼핑", value: "SHOPPING" },
  { label: "체험", value: "EXPERIENCE" },
  { label: "가성비", value: "BUDGET" },
  { label: "실내위주", value: "INDOOR" },
];

export default function PlaceCreatePage() {
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState<Option | null>(null);
  const [selectedStation, setSelectedStation] = useState<Option | null>(null);
  const [stationLookup, setStationLookup] = useState<{
    stationName: string;
    stationId: number | null;
  } | null>(null);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{
    keyword: string;
    stationId: number | null;
    places: KakaoPlace[];
  } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);

  // 선택한 역 이름 --> stationId 변환
  useEffect(() => {
    if (!selectedStation) return;

    let isCancelled = false;

    searchStations(selectedStation.value)
      .then((stations) => {
        if (isCancelled) return;
        const matched = stations.find(
          (station) => station.name === selectedStation.value,
        );
        setStationLookup({
          stationName: selectedStation.value,
          stationId: matched?.id ?? null,
        });
      })
      .catch((e) => {
        if (isCancelled) return;
        console.error(e);
        setStationLookup({
          stationName: selectedStation.value,
          stationId: null,
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedStation]);

  const selectedStationId =
    selectedStation && stationLookup?.stationName === selectedStation.value
      ? stationLookup.stationId
      : null;

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword || selectedPlace) return;

    let isCancelled = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        const data = await getKakaoSearch(
          selectedStationId ?? undefined,
          keyword,
        );
        if (isCancelled) return;
        setSearchResult({
          keyword,
          stationId: selectedStationId,
          places: data.places,
        });
      } catch (e) {
        if (isCancelled) return;
        console.error(e);
        setSearchResult({ keyword, stationId: selectedStationId, places: [] });
      }
    }, 300);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query, selectedStationId, selectedPlace]);

  const trimmedQuery = query.trim();
  const hasFreshResult =
    trimmedQuery !== "" &&
    !selectedPlace &&
    searchResult !== null &&
    searchResult.keyword === trimmedQuery &&
    searchResult.stationId === selectedStationId;
  const results = hasFreshResult ? searchResult.places : [];
  const isSearching = trimmedQuery !== "" && !selectedPlace && !hasFreshResult;

  const handleSelectPlace = (place: KakaoPlace) => {
    setSelectedPlace(place);
    setQuery(place.placeName);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>();

  const stationOptions: Option[] = selectedLine
    ? stationsByLineWithoutAll[selectedLine.value].map((station) => ({
        label: station,
        value: station,
      }))
    : [];

  const [selectedHastagOption1, setSelectedHastagOption1] =
    useState<HastagOption | null>(null);
  const [selectedHastagOption2, setSelectedHastagOption2] =
    useState<HastagOption | null>(null);

  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const canSubmit =
    selectedPlace !== null &&
    selectedStationId !== null &&
    selectedCategory !== undefined &&
    selectedHastagOption1 !== null &&
    selectedHastagOption2 !== null;

  const handleSave = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      await createPlace({
        stationId: selectedStationId,
        categoryCode: CATEGORY_CODES[selectedCategory],
        description,
        tagNames: [selectedHastagOption1.value, selectedHastagOption2.value],
        imageUrls: images,
        kakaoPlaceId: selectedPlace.kakaoPlaceId,
        placeName: selectedPlace.placeName,
        address: selectedPlace.address,
        contactNumber: selectedPlace.contactNumber,
        xCoordinate: selectedPlace.xCoordinate,
        yCoordinate: selectedPlace.yCoordinate,
      });
      navigate("/admin/place/");
    } catch (e) {
      console.error(e);
      showToast({
        message: e instanceof Error ? e.message : "장소 등록에 실패했습니다.",
      });
    }
  };

  return (
    <main className="flex flex-col h-dvh bg-gray-10 pt-[calc(var(--safe-top)+12px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Header showClose onCloseClick={() => navigate("/admin/place")} />

      <div className="flex justify-center">
        <div className="flex flex-col gap-8 w-[360px]">
          <section className="flex flex-col gap-4">
            <span className="text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] text-gray-100">
              호선 ∙ 지하철역
            </span>
            <div className="flex gap-2">
              <EditDropdown
                variant={selectedLine ? "primary" : "secondary"}
                mode="default"
                options={lineOptions}
                value={selectedLine?.value ?? ""}
                onSelect={(value) => {
                  const option = lineOptions.find((opt) => opt.value === value);
                  if (option) {
                    setSelectedLine(option);
                    setSelectedStation(null);
                  }
                }}
                placeholder="호선"
                renderOption="line"
              />
              <EditDropdown
                variant={selectedStation ? "primary" : "secondary"}
                mode="default"
                options={stationOptions}
                value={selectedStation?.value ?? ""}
                onSelect={(value) => {
                  const option = stationOptions.find(
                    (opt) => opt.value === value,
                  );
                  if (option) setSelectedStation(option);
                }}
                placeholder="지하철역"
              />
            </div>
          </section>

          <section className="relative">
            <div className="flex relative items-center">
              {selectedPlace ? (
                <div className="flex flex-col bg-white w-full rounded-lg p-2.5">
                  <span className="text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] text-gray-100">
                    {selectedPlace.placeName}
                  </span>
                  <p className="text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-70">
                    {selectedPlace.address}
                  </p>
                </div>
              ) : (
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="장소명 또는 주소를 입력하세요."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedPlace(null);
                  }}
                  className="bg-white rounded-lg px-4 py-3 pr-10 w-full focus:outline-primary-50 caret-primary-50 text-subtitle"
                />
              )}
              <button
                type="button"
                className="absolute right-2.5 flex size-5 items-center justify-center"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery("");
                  setSelectedPlace(null);
                }}
              >
                {query ? (
                  <Close className="size-5" />
                ) : (
                  <Search className="size-5" />
                )}
              </button>
            </div>

            {results.length > 0 && !selectedPlace && (
              <ul className="absolute top-full left-0 z-10 mt-2 flex w-full flex-col rounded-lg bg-white shadow-[0_0_28px_0_rgba(118,118,118,0.25)]">
                {results.map((place, index) => (
                  <li key={place.kakaoPlaceId}>
                    <button
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      className={`flex w-full flex-col gap-1 px-4 py-3 text-left ${
                        index > 0 ? "border-t border-gray-40" : ""
                      }`}
                    >
                      <span className="text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] text-gray-100">
                        {place.placeName}
                      </span>
                      <p className="text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-70">
                        {place.address}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {query && !selectedPlace && !isSearching && results.length < 1 && (
              <div className="absolute px-4 py-3 top-full left-0 z-10 mt-2 flex w-full rounded-lg bg-white shadow-[0_0_28px_0_rgba(118,118,118,0.25)]">
                <p className="text-body-01 leading-[1.4] tracking-[-0.35px] text-gray-100">
                  검색 결과가 없습니다.
                  <br />
                  카카오맵을 기준으로 장소명을 다시 확인해주세요.
                </p>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <span className="text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] text-gray-100">
              카테고리
            </span>
            <div className="flex gap-2">
              {CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  <DetailTagChip
                    content={category}
                    variant={
                      selectedCategory === category ? "primary" : "secondary"
                    }
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <span className="text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] text-gray-100">
              해시태그
            </span>
            <div className="flex gap-2">
              <EditDropdown
                variant={selectedHastagOption1 ? "primary" : "secondary"}
                mode="tag"
                options={hashtagSortOptions}
                value={selectedHastagOption1?.value ?? ""}
                placeholder="#해시태그1"
                onSelect={(value) => {
                  const option = hashtagSortOptions.find(
                    (opt) => opt.value === value,
                  );
                  if (option) setSelectedHastagOption1(option);
                }}
                disabledValues={
                  selectedHastagOption2 ? [selectedHastagOption2.value] : []
                }
              />
              <EditDropdown
                variant={selectedHastagOption2 ? "primary" : "secondary"}
                mode="tag"
                options={hashtagSortOptions}
                value={selectedHastagOption2?.value ?? ""}
                placeholder="#해시태그2"
                onSelect={(value) => {
                  const option = hashtagSortOptions.find(
                    (opt) => opt.value === value,
                  );
                  if (option) setSelectedHastagOption2(option);
                }}
                disabledValues={
                  selectedHastagOption1 ? [selectedHastagOption1.value] : []
                }
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <span className="text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] text-gray-100">
              한 줄 소개
            </span>
            <textarea
              placeholder="장소에 대한 한 줄 소개를 작성해주세요."
              value={description}
              className="p-4 rounded-lg bg-white outline-none min-h-[90px] resize-none caret-primary-50"
              onChange={(e) => setDescription(e.target.value)}
            />
          </section>

          <section className="flex flex-col gap-4">
            <span className="text-subtitle font-semibold leading-[1.4] tracking-[-0.4px] text-gray-100">
              장소 사진 추가
            </span>
            <div className="grid grid-cols-3 gap-4">
              <PlacePhotoUploader
                photos={images}
                onChange={setImages}
                kakaoPlaceId={selectedPlace?.kakaoPlaceId ?? ""}
              />
            </div>
          </section>

          <section className="fixed inset-x-0 bottom-[calc(var(--safe-bottom)+10px)] z-10 flex items-center justify-center">
            <CTAButton disabled={!canSubmit} onClick={handleSave}>
              작성 완료
            </CTAButton>
          </section>
        </div>
      </div>
    </main>
  );
}
