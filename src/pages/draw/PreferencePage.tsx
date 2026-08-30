import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type {
  RecommendationTravelStyle,
  RecommendationTravelTime,
} from "@/api/recommendation";
import type { Station } from "@/api/stations";
import Header from "@/components/Header";
import CTAButton from "@/components/CTAButton";
import HashtagChip from "@/pages/draw/components/HashtagChip";


const hashtagRows = [
  ['자연과함께', '골목여행', '시장구경' ],
  ['핫플레이스', '사진찍기좋은', '쇼핑'],
  ['체험', '가성비', '실내위주'],
];
const travelStyleMap: Record<string, RecommendationTravelStyle> = {
  자연과함께: "NATURE",
  골목여행: "ALLEY_TRIP",
  시장구경: "MARKET",
  핫플레이스: "HOTPLACE",
  사진찍기좋은: "PHOTO_SPOT",
  쇼핑: "SHOPPING",
  체험: "EXPERIENCE",
  가성비: "BUDGET",
  실내위주: "INDOOR",
};

type PreferencePageState = {
  selectedStation?: Station | null;
  selectedTime?: string | null;
  selectedCompanion?: string | null;
  departureStationId: number;
  departureStationName: string;
  travelTime: RecommendationTravelTime;
  companion: string | null;
  selectedTags?: string[];
};

function PreferencePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const condition = location.state as PreferencePageState | null;
  const [selectedTags, setSelectedTags] = useState<string[]>(
    condition?.selectedTags ?? [],
  );

  useEffect(() => {
    if (!condition) return;

    const currentTags = condition.selectedTags ?? [];
    const isSameSelection =
      currentTags.length === selectedTags.length &&
      currentTags.every((tag, index) => tag === selectedTags[index]);

    if (isSameSelection) return;

    navigate(".", {
      replace: true,
      state: {
        ...condition,
        selectedTags,
      },
    });
  }, [condition, navigate, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      // 이미 선택된 태그면 해제
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }

      // 새로 선택하려는데 이미 3개면 추가하지 않음
      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, tag];
    });
  };

  const isFormValid = selectedTags.length > 0;

  if (!condition) {
    navigate("/draw/condition", { replace: true });
    return null;
  }

  const handleBack = () => {
    navigate("/draw/condition", {
      replace: true,
      state: {
        selectedStation: condition.selectedStation ?? null,
        selectedTime: condition.selectedTime ?? null,
        selectedCompanion: condition.selectedCompanion ?? null,
        selectedTags,
      },
    });
  };

  const mappedTravelStyles = selectedTags.map((tag) => {
    const mapped = travelStyleMap[tag];

    if (!mapped) {
      throw new Error(`매핑되지 않은 여행 스타일 태그입니다: ${tag}`);
    }

    return mapped;
  });

  return (
    <main className="flex flex-col h-dvh overflow-hidden bg-white items-center pt-[var(--safe-top)]">
      <Header showBack onBackClick={handleBack} />

      <section className="flex h-full flex-col items-center justify-between pt-10 pb-[calc(var(--safe-bottom)+10px)]">
        <div className="flex flex-col items-center gap-[50px]">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-headline font-semibold text-gray-100 leading-[1.4] tracking-[-0.025em] text-center">
              어떤 여행을 하고 싶나요?
            </h1>
            <p className="text-body-01 text-primary-60 leading-[1.4] tracking-[-0.025em] text-center">
              해시태그는 최대 3개까지<br />
              선택할 수 있어요.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {hashtagRows.map((row) => (
              <div key={row.join('-')} className="flex justify-center gap-2">
                {row.map((tag) => (
                  <HashtagChip
                    key={tag}
                    label={tag}
                    selected={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className='flex w-full items-center justify-center'>
          <CTAButton 
            disabled={!isFormValid}
            onClick={() => {
              const recommendationRequest = {
                recommendationSessionId: crypto.randomUUID(),
                departureStationId: condition.departureStationId,
                travelTime: condition.travelTime,
                travelStyles: mappedTravelStyles,
              };

              navigate('/draw/loading', {
                state: {
                  source: 'recommend',
                  recommendationRequest,
                  selectedStation: condition.selectedStation ?? null,
                  selectedTime: condition.selectedTime ?? null,
                  selectedCompanion: condition.selectedCompanion ?? null,
                  selectedTags,
                  companion: condition.companion,
                },
              });
            }}
          >
            나만의 환승역 찾기
          </CTAButton>
        </section>
      </section>
    </main>
  )
}
export default PreferencePage
