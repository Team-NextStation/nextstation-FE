export interface Line {
  id: number;
  name: string;
  code: string;
}

export interface Place {
  placeId: number;
  placeName: string;
  description: string;
  categoryCode: string;
  categoryName: string;
  imageUrl: null | string;
  xCoordinate: number;
  yCoordinate: number;
  orderNum: number;
}

export interface CourseDetailResponseItem {
  // 백으로부터의 응답 형태
  courseId: number;
  name: string;
  shareToken: string;
  stationId: number;
  stationName: string;
  line: Line;
  places: Place[];
}

export interface CourseDetail {
  // 프론트에서의 변수 형태
  courseId: number;
  courseName: string;
  shareToken: string;
  stationId: number;
  stationName: string;
  lineId: number;
  places: Place[];
}

export interface CopyPreviewCourseResponseItem {
  courseId: number;
  name: string;
  stationId: number;
  stationName: string;
  line: Line;
  places: Place[];
}

export interface CopyPreviewCourse {
  courseId: number;
  courseName: string;
  stationId: number;
  stationName: string;
  lineId: number;
  places: Place[];
}

import { fetchWithRequiredAuth, getAccessToken } from "@/api/auth";
import type { SubwayLine } from "@/types/subway";

import { API_BASE_URL } from "@/api/config";

export interface CourseDetailImage {
  id: number;
  src: string;
  alt: string;
}

export interface CourseDetailPlaceData {
  id: number;
  name: string;
  description: string;
  imageUrl?: string | null;
  imagePosition: "left" | "right";
}

export interface CourseDetailData {
  id: number;
  line: SubwayLine;
  stationName: string;
  journalTitle: string;
  viewCount: number;
  saveCount: number;
  writerId: number;
  writerName: string;
  writerProfileImageUrl: string | null;
  visitedAt: string;
  isMine?: boolean;
  isLiked?: boolean;
  review: string;
  duration: string;
  tags: string[];
  images: CourseDetailImage[];
  places: CourseDetailPlaceData[];
  isPublic: boolean;
}

function mapCourseDetail(item: CourseDetailResponseItem): CourseDetail {
  return {
    courseId: item.courseId,
    courseName: item.name,
    shareToken: item.shareToken,
    stationId: item.stationId,
    stationName: item.stationName,
    lineId: item.line.id,
    places: item.places,
  };
}

// 내가 만든 코스 확인
export async function getCourseDetail(courseId: number): Promise<CourseDetail> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/members/me/courses/${courseId}`,
    {},
  );

  if (!response.ok) {
    throw new Error("내가 만든 코스 확인 실패");
  }

  const json = await response.json();

  const item: CourseDetailResponseItem = json.data;

  return mapCourseDetail(item);
}

export async function getSharedCourseDetail(
  shareToken: string,
): Promise<CourseDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/courses/share/${encodeURIComponent(shareToken)}`,
  );

  if (!response.ok) {
    throw new Error("공유 코스 정보를 불러오지 못했습니다.");
  }

  const json = await response.json();

  const item: CourseDetailResponseItem = json.data;

  return mapCourseDetail(item);
}

export async function getCopyPreviewCourse(
  courseId: number,
): Promise<CopyPreviewCourse> {
  if (!getAccessToken()) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/courses/${courseId}/copy-preview`,
    {},
  );

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(json?.message ?? "코스 미리보기를 불러오지 못했습니다.");
  }

  const item: CopyPreviewCourseResponseItem = json.data;

  return {
    courseId: item.courseId,
    courseName: item.name,
    stationId: item.stationId,
    stationName: item.stationName,
    lineId: item.line.id,
    places: item.places,
  };
}

export interface PatchCourseDetailPayload {
  name?: string;
  placeIds?: number[];
}

export interface PatchCourseDetailResult {
  courseId: number;
  name: string;
}

export interface CopiedCourse {
  courseId: number;
  name: string;
  stationName: string;
}

// 공개 코스를 내 코스로 복제
export async function copyCourse(
  courseId: number,
  name: string,
  placeIds?: number[],
): Promise<CopiedCourse> {
  if (!getAccessToken()) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/courses/${courseId}/copy`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        ...(placeIds ? { placeIds } : {}),
      }),
    },
  );

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const reason = json?.reasons ? Object.values(json.reasons)[0] : undefined;
    throw new Error(reason ?? json?.message ?? "코스를 복제하지 못했습니다.");
  }

  return json.data;
}

// 코스 수정
export async function patchCourseDetail(
  courseId: number,
  payload: PatchCourseDetailPayload,
): Promise<PatchCourseDetailResult> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다");
  }

  const response = await fetchWithRequiredAuth(`${API_BASE_URL}/api/v1/courses/${courseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const reason = errorJson?.reasons
      ? Object.values(errorJson.reasons)[0]
      : undefined;
    throw new Error(reason ?? errorJson?.message ?? "코스 수정 실패");
  }

  const json = await response.json();

  return json.data;
}
