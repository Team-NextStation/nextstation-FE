import { fetchWithRequiredAuth } from "./auth";
import type { StatusChipVariant } from "@/pages/admin/components/StatusChip";
import type { SubwayLine } from "@/types/subway";
import { API_BASE_URL } from "./config";

export interface Line {
  id: SubwayLine;
  name: string;
  code: string;
}

export interface Station {
  stationId: number;
  stationName: string;
}

export interface Place {
  placeId: number;
  representativeLine: Line;
  stationId: number;
  stationName: string;
  categoryCode: string;
  categoryName: string;
  placeName: string;
  tags: string[];
  description: string;
  imageUrl: string;
  status: StatusChipVariant;
}

export interface PlaceList {
  availableLines: Line[];
  availableStations: Station[];
  places: Place[];
  nextCursor: string | null;
  hasNext: boolean;
}

// 관리자 장소 목록 조회
export async function getPlaces(
  lineId?: number,
  stationId?: number,
  categoryCode?: string,
  status?: StatusChipVariant[],
  cursor?: string | null,
): Promise<PlaceList> {
  const params = new URLSearchParams();
  if (lineId !== undefined) params.set("lineId", String(lineId));
  if (stationId !== undefined) params.set("stationId", String(stationId));
  if (categoryCode) params.set("categoryCode", categoryCode);
  status?.forEach((value) => params.append("status", value));
  if (cursor) params.set("cursor", cursor);

  const query = params.toString();
  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/admin/places${query ? `?${query}` : ""}`,
  );

  if (!response.ok) {
    throw new Error("장소 목록 조회 실패");
  }

  const json = await response.json();

  return json.data as PlaceList;
}

// 관리자 장소명 검색
export async function getSearchPlaces(keyword?: string): Promise<PlaceList> {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);

  const query = params.toString();
  const url = `${API_BASE_URL}/api/v1/admin/places/search${query ? `?${query}` : ""}`;
  const response = await fetchWithRequiredAuth(url);

  if (!response.ok) {
    throw new Error("장소 목록 검색 실패");
  }

  const json = await response.json();

  return {
    availableLines: [],
    availableStations: [],
    places: Array.isArray(json.data) ? json.data : [],
    nextCursor: null,
    hasNext: false,
  };
}

export interface Image {
  imageId: number;
  imageUrl: string;
}

export interface placeDetail {
  placeId: number;
  placeName: string;
  representativeLine: Line;
  stationId: number;
  stationName: string;
  address: string;
  xCoordinate: number;
  yCoordinate: number;
  kakaoPlaceUrl: string;
  status: StatusChipVariant;
  categoryCode: string;
  categoryName: string;
  tags: string[];
  description: string;
  images: Image[];
  deleteReason: string;
  rejectReason: string;
}

// 관리자 장소 상세 조회
export async function getPlaceDetail(placeId: number): Promise<placeDetail> {
  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/admin/places/${placeId}`,
  );

  if (!response.ok) {
    throw new Error("장소 목록 검색 실패");
  }

  const json = await response.json();

  return json.data as placeDetail;
}

export interface PatchInfo {
  tagNames: string[];
  description: string;
  imageUrls: string[];
}

// 관리자 기존 장소 수정
export async function patchPlaceInfo(
  placeId: number,
  tagNames: string[],
  description: string,
  imageUrls: string[],
): Promise<PatchInfo> {
  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/admin/places/${placeId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tagNames,
        description,
        imageUrls,
      }),
    },
  );

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const reason = errorJson?.reasons
      ? Object.values(errorJson.reasons)[0]
      : undefined;
    throw new Error(reason ?? errorJson?.message ?? "기존 장소 정보 수정 실패");
  }

  const json = await response.json();

  return json.data;
}

export interface PlaceStatusResult {
  placeId: number;
  status: StatusChipVariant;
}

// 관리자 장소 상태 변경
export async function patchPlaceStatus(
  placeId: number,
  status: StatusChipVariant,
  reason?: string,
): Promise<PlaceStatusResult> {
  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/admin/places/${placeId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        reason,
      }),
    },
  );

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const reason = errorJson?.reasons
      ? Object.values(errorJson.reasons)[0]
      : undefined;
    throw new Error(reason ?? errorJson?.message ?? "장소 상태 변경 실패");
  }

  const json = await response.json();

  return json.data;
}

export interface KakaoPlace {
  kakaoPlaceId: string;
  placeName: string;
  address: string;
  contactNumber: string;
  xCoordinate: number;
  yCoordinate: number;
  kakaoPlaceUrl: string;
}
export interface KakaoSearchResult {
  places: KakaoPlace[];
}

// 관리자 카카오 장소 검색
export async function getKakaoSearch(
  stationId?: number,
  keyword?: string,
  address?: string,
): Promise<KakaoSearchResult> {
  const params = new URLSearchParams();
  if (address !== undefined) params.set("address", address);
  if (keyword !== undefined) params.set("keyword", keyword);
  if (stationId !== undefined) params.set("stationId", stationId.toString());

  const query = params.toString();
  const url = `${API_BASE_URL}/api/v1/admin/places/kakao-search${query ? `?${query}` : ""}`;
  const response = await fetchWithRequiredAuth(url);

  if (!response.ok) {
    throw new Error("카카오 장소 목록 검색 실패");
  }

  const json = await response.json();

  return json.data;
}

export interface PlaceRequest {
  stationId: number;
  categoryCode: string;
  description: string;
  tagNames: string[];
  imageUrls: string[];
  kakaoPlaceId: string;
  placeName: string;
  address: string;
  contactNumber: string;
  xCoordinate: number;
  yCoordinate: number;
}

// 관리자 장소 등록
export async function createPlace({
  stationId,
  categoryCode,
  description,
  tagNames,
  imageUrls,
  kakaoPlaceId,
  placeName,
  address,
  contactNumber,
  xCoordinate,
  yCoordinate,
}: PlaceRequest): Promise<PlaceRequest> {
  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/admin/places`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stationId,
        categoryCode,
        description,
        tagNames,
        imageUrls,
        kakaoPlaceId,
        placeName,
        address,
        contactNumber,
        xCoordinate,
        yCoordinate,
      }),
    },
  );

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const reason = errorJson?.reasons
      ? Object.values(errorJson.reasons)[0]
      : undefined;
    throw new Error(reason ?? errorJson?.message ?? "장소 등록 실패");
  }

  const json = await response.json();

  return json.data;
}
