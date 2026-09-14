import {
  fetchWithOptionalAuth,
  fetchWithRequiredAuth,
  getAccessToken,
} from "./auth";

import { API_BASE_URL } from "@/api/config";

export interface ExploreCourseLine {
  id: number;
  name: string;
  code: string;
}
export interface ExploreLine extends ExploreCourseLine {
  hasCourses: boolean;
}
export interface ExploreStation {
  stationId: number;
  stationName: string;
  hasCourses: boolean;
}
export interface ExploreCourse {
  courseId: number;
  journalId: number;
  name: string;
  stationId: number;
  stationName: string;
  line: ExploreCourseLine | null;
  tags: string[];
  likeCount: number;
  isLiked: boolean;
  imageUrl: string | null;
}
export interface ConceptTour {
  conceptTourId: number;
  name: string;
  description: string;
  courseCount: number;
}
export interface ExploreMainResponse {
  popularCourses: ExploreCourse[];
  conceptTours: ConceptTour[];
  lines: ExploreLine[];
  selectedLineId: number | null;
  lineCourses: ExploreCourse[];
}
export interface ExploreCourseListResponse {
  courses: ExploreCourse[];
  availableStations: ExploreStation[];
  nextCursor: string | null;
  hasNext: boolean;
}
export type ExploreSort = "LATEST" | "POPULAR";

export function getExploreCourseDetailPath(course: ExploreCourse): string {
  return `/course/${course.journalId}`;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetchWithOptionalAuth(`${API_BASE_URL}${path}`);
  if (!response.ok) throw new Error("둘러보기 정보를 불러오지 못했습니다.");
  const json = await response.json();
  return json.data as T;
}

async function requiredAuthRequest<T>(path: string): Promise<T> {
  const response = await fetchWithRequiredAuth(`${API_BASE_URL}${path}`);
  if (!response.ok) throw new Error("둘러보기 정보를 불러오지 못했습니다.");
  const json = await response.json();
  return json.data as T;
}

function query(
  path: string,
  values: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params.size ? `${path}?${params}` : path;
}

export const getExploreMain = () =>
  request<ExploreMainResponse>("/api/v1/explore");
export const getExploreCourses = (options: {
  lineId?: number;
  stationId?: number;
  keyword?: string;
  sort?: ExploreSort;
  cursor?: string;
  size?: number;
}) =>
  request<ExploreCourseListResponse>(query("/api/v1/explore/courses", options));
export const getPopularExploreCourses = (cursor?: string, size = 30) =>
  request<ExploreCourseListResponse>(
    query("/api/v1/explore/courses/popular", { cursor, size }),
  );
export const getConceptTours = () =>
  requiredAuthRequest<ConceptTour[]>("/api/v1/explore/concept-tours");
export const getConceptTourCourses = (
  conceptTourId: number,
  sort: ExploreSort = "POPULAR",
  cursor?: string,
  size = 10,
) =>
  requiredAuthRequest<ExploreCourseListResponse>(
    query(`/api/v1/explore/concept-tours/${conceptTourId}/courses`, {
      sort,
      cursor,
      size,
    }),
  );

export async function likeExploreCourse(courseId: number): Promise<void> {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/courses/${courseId}/likes`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("코스 좋아요에 실패했습니다.");
  }
}

export async function unlikeExploreCourse(courseId: number): Promise<void> {
  const accessToken = getAccessToken();
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/courses/${courseId}/likes`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    throw new Error(errorJson?.message ?? "코스 좋아요 취소에 실패했습니다.");
  }
}
