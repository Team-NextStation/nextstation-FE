import { fetchWithOptionalAuth } from "@/api/auth";
import type { SubwayLine } from "@/types/subway";

const API_BASE_URL = "";

export type RecommendationTravelTime =
  | "THIRTY_MINUTES"
  | "ONE_HOUR"
  | "ANY";
  
export type RecommendationTravelStyle =
  | "NATURE"
  | "ALLEY_TRIP"
  | "MARKET"
  | "HOTPLACE"
  | "PHOTO_SPOT"
  | "SHOPPING"
  | "EXPERIENCE"
  | "BUDGET"
  | "INDOOR";

export const TRAVEL_STYLE_LABELS: Record<RecommendationTravelStyle, string> = {
  NATURE: "자연과함께",
  ALLEY_TRIP: "골목여행",
  MARKET: "시장구경",
  HOTPLACE: "핫플레이스",
  PHOTO_SPOT: "사진찍기좋은",
  SHOPPING: "쇼핑",
  EXPERIENCE: "체험",
  BUDGET: "가성비",
  INDOOR: "실내위주",
};

export interface CustomRecommendationRequest {
  recommendationSessionId: string;
  departureStationId: number;
  travelTime: RecommendationTravelTime;
  travelStyles: RecommendationTravelStyle[];
}

export interface RecommendationLine {
  id: SubwayLine;
  name: string;
  code: string;
}

export interface RecommendationStation {
  stationId: number;
  stationName: string;
  description: string;
  todos: string[];
  lines: RecommendationLine[];
}

export interface CustomRecommendationResponseData {
  station: RecommendationStation;
  travelDurationMinutes: number;
}

export async function getCustomRecommendation(
  body: CustomRecommendationRequest,
): Promise<CustomRecommendationResponseData> {
  console.log("[recommendation] request body", body);

  const response = await fetchWithOptionalAuth(`${API_BASE_URL}/api/v1/recommendations/custom`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log("[recommendation] response status", response.status);

  if (!response.ok) {
    let message = "맞춤 추천 실패";

    try {
      const errorJson = await response.json();
      message = errorJson.message || message;
    } catch {
      // Ignore JSON parse errors and keep the default message.
    }

    throw new Error(message);
  }

  const json = await response.json();
  const data = json.data;

  return {
    station: {
      stationId: data.station.stationId,
      stationName: data.station.stationName,
      description: data.station.description,
      todos: data.station.todos ?? [],
      lines: (data.station.lines ?? []).map((line: RecommendationLine) => ({
        id: line.id,
        name: line.name,
        code: line.code,
      })),
    },
    travelDurationMinutes: data.travelDurationMinutes,
  };
}
