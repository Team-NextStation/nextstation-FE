export interface StationLine {
  id: number;
  name: string;
  code: string;
}

export interface Station {
  id: number;
  name: string;
  lines: StationLine[];
}

import { API_BASE_URL } from "@/api/config";

// 출발역 검색
export async function searchStations(
  keyword: string,
  signal?: AbortSignal
): Promise<Station[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/stations?keyword=${encodeURIComponent(keyword)}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error('역 검색 요청 실패');
  }

  const json = await response.json();

  return (json.data ?? []).map(
    (item: {
      stationId: number;
      stationName: string;
      lines: StationLine[];
    }) => ({
      id: item.stationId,
      name: item.stationName,
      lines: item.lines ?? [],
    })
  );
}
