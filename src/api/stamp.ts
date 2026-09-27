import { fetchWithRequiredAuth, getAccessToken } from "./auth";

export interface Line {
  id: number;
  name: string;
  code: string;
}

export interface Stamp {
  stationId: number;
  stationName: string;
  line: Line;
}

export interface StampsResponseItem {
  // 백으로부터의 응답 형태
  totalCount: number;
  stamps: Stamp[];
}

export interface Stamps {
  // 프론트에서의 변수 형태
  totalCount: number;
  stamps: Stamp[];
}

import { API_BASE_URL } from "@/api/config";

// 내 스탬프 목록 조회
export async function getStamps(): Promise<Stamps> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다");
  }

  const response = await fetchWithRequiredAuth(`${API_BASE_URL}/api/v1/stamps`);

  if (!response.ok) {
    throw new Error("스탬프 목록 조회 실패");
  }

  const json = await response.json();

  const item: StampsResponseItem = json.data;

  return {
    totalCount: item.totalCount,
    stamps: item.stamps,
  };
}

export interface StampDetailResponseItem {
  // 백으로부터의 응답 형태
  staionId: number;
  stationName: string;
  line: Line;
  acquiredAt: string;
  journalId: number;
}

export interface StampDetail {
  // 프론트에서의 변수 형태
  stationId: number;
  stationName: string;
  line: Line;
  acquiredAt: string;
  journalId: number;
}

// 내 스탬프 상세 조회
export async function getStampsDetail(stationId: number): Promise<StampDetail> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다");
  }

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/stamps/${stationId}`,
  );

  if (!response.ok) {
    throw new Error("스탬프 상세 조회 실패");
  }

  const json = await response.json();

  const item: StampDetailResponseItem = json.data;

  return {
    stationId: item.staionId,
    stationName: item.stationName,
    line: item.line,
    acquiredAt: item.acquiredAt,
    journalId: item.journalId,
  };
}
