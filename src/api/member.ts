import {
  fetchWithOptionalAuth,
  fetchWithRequiredAuth,
  getAccessToken,
} from "./auth";

export class MemberApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MemberApiError";
    this.status = status;
  }
}

export interface MemberProfile {
  memberId: number;
  nickname: string;
  profileImageUrl: string | null;
}

export interface LikedCourseLine {
  id: number;
  name: string;
  code: string;
}

export interface PublicMemberProfile extends MemberProfile {
  publicCourseCount: number;
  stampCount: number;
}

export interface PublicMemberStamp {
  stationId: number;
  stationName: string;
  line: LikedCourseLine | null;
}

export interface PublicMemberCourse {
  courseId: number;
  journalId: number;
  name: string;
  stationId: number;
  stationName: string;
  line: LikedCourseLine | null;
  imageUrl: string | null;
  likeCount: number;
}

export interface PublicMemberCourses {
  courses: PublicMemberCourse[];
  nextCursor: string | null;
  hasNext: boolean;
}

import { API_BASE_URL } from "@/api/config";
const MEMBER_PROFILE_STORAGE_KEY = "member.profile";

async function getPublicMemberData<T>(path: string): Promise<T> {
  const response = await fetchWithOptionalAuth(`${API_BASE_URL}${path}`);
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(json?.message ?? "프로필 정보를 불러오지 못했습니다.");
  }

  return json.data as T;
}

export async function getPublicMemberProfile(
  memberId: number,
): Promise<PublicMemberProfile> {
  const data = await getPublicMemberData<
    Omit<PublicMemberProfile, "publicCourseCount" | "stampCount"> & {
      publicCourseCount: string | number;
      stampCount: string | number;
    }
  >(`/api/v1/members/${memberId}/profile`);

  return {
    ...data,
    publicCourseCount: Number(data.publicCourseCount),
    stampCount: Number(data.stampCount),
  };
}

export async function getPublicMemberStamps(
  memberId: number,
): Promise<PublicMemberStamp[]> {
  const data = await getPublicMemberData<{
    stampCount: number;
    stamps: PublicMemberStamp[];
  }>(`/api/v1/members/${memberId}/stamps`);

  return data.stamps ?? [];
}

export async function getPublicMemberCourses(
  memberId: number,
  cursor?: string,
): Promise<PublicMemberCourses> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  const query = params.size ? `?${params}` : "";
  const data = await getPublicMemberData<{
    courses: PublicMemberCourse[];
    nextCursor: string | number | null;
    hasNext: boolean;
  }>(`/api/v1/members/${memberId}/courses${query}`);

  return {
    courses: data.courses ?? [],
    nextCursor: data.nextCursor == null ? null : String(data.nextCursor),
    hasNext: data.hasNext ?? false,
  };
}

export function saveCachedMyProfile(profile: MemberProfile) {
  sessionStorage.setItem(MEMBER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function getCachedMyProfile(): MemberProfile | null {
  const storedProfile = sessionStorage.getItem(MEMBER_PROFILE_STORAGE_KEY);

  if (!storedProfile) {
    return null;
  }

  try {
    return JSON.parse(storedProfile) as MemberProfile;
  } catch {
    return null;
  }
}

export function clearCachedMyProfile() {
  sessionStorage.removeItem(MEMBER_PROFILE_STORAGE_KEY);
}

export async function getMyProfile(): Promise<MemberProfile> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const response = await fetchWithRequiredAuth(`${API_BASE_URL}/api/v1/members/me`);

  if (!response.ok) {
    throw new Error("내 프로필 조회 실패");
  }

  const json = await response.json();
  const data = json.data;

  const profile = {
    memberId: data.memberId,
    nickname: data.nickname,
    profileImageUrl: data.profileImageUrl,
  };

  saveCachedMyProfile(profile);

  return profile;
}

export async function updateMyProfile(updates: {
  nickname?: string;
  profileImageUrl?: string;
}): Promise<MemberProfile> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const response = await fetchWithRequiredAuth(`${API_BASE_URL}/api/v1/members/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new MemberApiError(
      response.status,
      json?.message ?? "내 프로필 수정 실패",
    );
  }

  const json = await response.json();
  const data = json.data;

  const profile = {
    memberId: data.memberId,
    nickname: data.nickname,
    profileImageUrl: data.profileImageUrl,
  };

  saveCachedMyProfile(profile);

  return profile;
}

// 회원탈퇴
export async function deleteMyProfile() {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const response = await fetchWithRequiredAuth(`${API_BASE_URL}/api/v1/members/me`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("회원 탈퇴 실패");
  }
}

export interface LikedCourse {
  courseId: number;
  journalId: number;
  name: string;
  stationId: number;
  stationName: string;
  line: LikedCourseLine;
  imageUrl: string | null;
}

interface LikedCoursesResponseData {
  courses: LikedCourse[];
  nextCursor: string | null;
  hasNext: boolean;
}

export async function getLikedCourses(
  cursor?: string,
  size = 10,
): Promise<LikedCoursesResponseData> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const params = new URLSearchParams();

  if (cursor) {
    params.set("cursor", cursor);
  }

  params.set("size", String(size));

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/members/me/liked-courses?${params.toString()}`,
    {},
  );

  if (!response.ok) {
    throw new Error("좋아요한 코스 목록 조회 실패");
  }

  const json = await response.json();
  const data = json.data;

  return {
    courses: (data.courses ?? []).map((course: LikedCourse) => ({
      courseId: course.courseId,
      journalId: course.journalId,
      name: course.name,
      stationId: course.stationId,
      stationName: course.stationName,
      line: course.line,
      imageUrl: course.imageUrl,
    })),
    nextCursor: data.nextCursor ?? null,
    hasNext: data.hasNext ?? false,
  };
}

export async function deleteLikedCourses(courseIds: number[]): Promise<void> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/members/me/liked-courses`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseIds }),
    },
  );

  if (!response.ok) {
    throw new Error("좋아요한 코스 다중 취소 실패");
  }
}

export async function deleteAllLikedCourses(
  exceptCourseIds: number[],
): Promise<void> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/members/me/liked-courses/all`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ exceptCourseIds }),
    },
  );

  if (!response.ok) {
    throw new Error("좋아요한 코스 전체 취소 실패");
  }
}
