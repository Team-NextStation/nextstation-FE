import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { RecommendationTravelTime } from "@/api/recommendation";
import type { Station } from "@/api/stations";
import Header from "@/components/Header";
import CTAButton from "@/components/CTAButton";
import SearchBar from "./components/SearchBar";
import ChoiceChip from "@/pages/draw/components/ChoiceChip";
import RecentStationChip from "./components/RecentStationChip";

const timeOptions = ["30분 이내", "1시간 이내", "상관 없음"] as const;

const mapTravelTime = (
  value: string,
): "THIRTY_MINUTES" | "ONE_HOUR" | "ANY" => {
  if (value === "30분 이내") return "THIRTY_MINUTES";
  if (value === "1시간 이내") return "ONE_HOUR";
  return "ANY";
};

const companionOptions = ['혼자', '친구와', '연인과', '부모님과', '아이와'];

const RECENT_STATIONS_KEY = "recentStations";
const MAX_RECENT_STATIONS = 5;

type ConditionPageState = {
  selectedStation?: Station | null;
  selectedTime?: string | null;
  selectedCompanion?: string | null;
  selectedTags?: string[];
  departureStationId?: number;
  departureStationName?: string;
  travelTime?: RecommendationTravelTime;
  companion?: string | null;
};

function ConditionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const conditionState = location.state as ConditionPageState | null;
  const initialSelectedStation = conditionState?.selectedStation ?? null;
  const [query, setQuery] = useState(initialSelectedStation?.name ?? '');
  const [selectedStation, setSelectedStation] = useState<Station | null>(
    initialSelectedStation,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    conditionState?.selectedTime ?? null,
  );
  const [selectedCompanion, setSelectedCompanion] = useState<string | null>(
    conditionState?.selectedCompanion ?? null,
  );

  const [recentStations, setRecentStations] = useState<Station[]>(() => {
  const stored = localStorage.getItem(RECENT_STATIONS_KEY);

  if (!stored) return [];

  try {
    return JSON.parse(stored) as Station[];
  } catch (error) {
    console.error(error);
    localStorage.removeItem(RECENT_STATIONS_KEY);
    return [];
  }
});

  const saveRecentStations = (stations: Station[]) => {
    setRecentStations(stations);
    localStorage.setItem(RECENT_STATIONS_KEY, JSON.stringify(stations));
  };

  const handleSelectStation = (station: Station | null) => {
    setSelectedStation(station);

    if (!station) return;

    const nextRecentStations = [
      station,
      ...recentStations.filter((item) => item.id !== station.id),
    ].slice(0, MAX_RECENT_STATIONS);

    saveRecentStations(nextRecentStations);
  };

  const handleRemoveRecent = (stationId: number) => {
    const nextRecentStations = recentStations.filter(
      (station) => station.id !== stationId
    );
    saveRecentStations(nextRecentStations);
  };

  const handleSelectRecentStation = (station: Station) => {
    setQuery(station.name);
    handleSelectStation(station);
  };

  const isFormValid =
  selectedStation !== null &&
  selectedTime !== null &&
  selectedCompanion !== null;

  return (
    <main className="flex flex-col h-dvh overflow-hidden bg-white items-center pt-[var(--safe-top)]">
      <Header showBack/>

      <section className="flex h-full flex-col items-center justify-between pt-10 pb-[calc(var(--safe-bottom)+10px)]">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-headline font-semibold text-gray-100 leading-[1.4] tracking-[-0.025em] text-center">
            어디서, 얼마나, 누구와 <br />
            갈 계획인가요?
          </h1>
          <div className="flex flex-col w-[360px] items-center justify-center gap-10">
            
            {/* 출발역 */}
            <div className="flex flex-col w-full gap-4 items-start">
              <div className="flex flex-col gap-1 items-start">
                <p className="text-subtitle text-gray-100 leading-[1.4] tracking-[-0.025em]">
                  출발역은 어디인가요?
                </p>
                <p className="text-caption text-gray-70 leading-[1.4] tracking-[-0.025em]">
                  현재 버전에서는 서울 안에서의 역만 출발역으로 설정 가능해요
                </p>
              </div>
              
              <div className="flex flex-col w-full gap-2">
                <SearchBar
                  query={query}
                  onQueryChange={setQuery}
                  selectedStation={selectedStation}
                  onSelectStation={handleSelectStation}
                />

                {!query.trim() && recentStations.length > 0 && (
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {recentStations.map((station) => (
                    <RecentStationChip
                      key={station.id}
                      name={station.name}
                      lines={station.lines}
                      onSelect={() => handleSelectRecentStation(station)}
                      onRemove={() => handleRemoveRecent(station.id)}
                    />
                  ))}
                </div>
              )}
              </div>
              
            </div>

            {/* 시간 */}
            <div className="flex flex-col w-full gap-4 items-start">
              <p className="text-subtitle text-gray-100 leading-[1.4] tracking-[-0.025em]">
                얼마나 걸렸으면 좋겠나요?
              </p>
              <div className="flex w-full items-center gap-[15px]">
                {timeOptions.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={selectedTime === option}
                    onClick={() => setSelectedTime(option)}
                  />
                ))}
              </div>
            </div>

            {/* 누구와 */}
            <div className="flex flex-col w-full gap-4 items-start">
              <p className="text-subtitle text-gray-100 leading-[1.4] tracking-[-0.025em]">
                누구와 가나요?
              </p>
              <div className="flex flex-wrap w-full items-center justify-center gap-[15px]">
                {companionOptions.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    selected={selectedCompanion === option}
                    onClick={() => setSelectedCompanion(option)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className='flex w-full items-center justify-center'>
          <CTAButton 
            disabled={!isFormValid}
            onClick={() => navigate('/draw/preference', {
              state: {
                selectedStation,
                selectedTime,
                selectedCompanion,
                selectedTags: conditionState?.selectedTags ?? [],
                departureStationId: selectedStation!.id,
                departureStationName: selectedStation!.name,
                travelTime: mapTravelTime(selectedTime!),
                companion: selectedCompanion, // UI용만 보관
              },
            })}
          >
            다음
          </CTAButton>
        </section>
      </section>
    </main>
  )
}
export default ConditionPage
