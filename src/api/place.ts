import {
  fetchWithOptionalAuth,
  fetchWithRequiredAuth,
  getAccessToken,
} from "@/api/auth";
export interface PlaceReview {
  // ReviewPreviewCard에서 사용됨
  reviewId: number;
  writerId: number;
  writerNickname: string;
  writerProfileImageUrl: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

export interface PlaceResponseItem {
  // 백으로부터의 응답 형태
  placeId: number;
  placeName: string;
  description: string;
  category: string;
  address: string;
  contactNumber: string | null;
  kakaoPlaceUrl: string;
  totalReviewCount: number;
  images: string[] | null;
  reviews: PlaceReview[] | null;
}

export interface Place {
  // 프론트에서의 변수 형태
  placeId: number;
  placeName: string;
  description: string;
  category: string;
  address: string;
  contactNumber: string | null;
  kakaoPlaceUrl: string;
  totalReviewCount: number;
  images: string[];
  reviews: PlaceReview[];
}

export interface CourseLine {
  id: number;
  name: string;
  code: string;
}

export interface CourseResponseItem {
  // 백으로부터의 응답 형태
  journalId: number;
  name: string;
  stationId: number;
  stationName: string;
  line: CourseLine;
  placeCount: number;
  travelDuration: string;
  tags: string[];
  imageUrl: string | null;
}

export interface Course {
  // 프론트에서의 변수 형태
  journalId: number;
  courseName: string;
  lineId: number;
  placeCount: number;
  travelDuration: string;
  tags: string[];
  imageUrl: string | null;
}

import { API_BASE_URL } from "@/api/config";

// 장소 상세 조회
export async function getPlaceDetail(placeId: number): Promise<Place> {
  const response = await fetchWithOptionalAuth(
    `${API_BASE_URL}/api/v1/places/${placeId}`,
  );

  if (!response.ok) {
    throw new Error("장소 상세 조회 실패");
  }

  const json = await response.json();

  const item: PlaceResponseItem = json.data;

  return {
    placeId: item.placeId,
    placeName: item.placeName,
    description: item.description,
    category: item.category,
    address: item.address,
    contactNumber: item.contactNumber,
    kakaoPlaceUrl: item.kakaoPlaceUrl,
    totalReviewCount: item.totalReviewCount,
    images: item.images ?? [],
    reviews: item.reviews ?? [],
  };
}

// 장소를 포함한 코스 조회
export async function getPlaceCourses(placeId: number): Promise<Course[]> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다");
  }

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/places/${placeId}/courses`,
    {},
  );

  if (!response.ok) {
    throw new Error("장소를 포함한 코스 목록 조회 실패");
  }

  const json = await response.json();

  return (json.data ?? []).map((item: CourseResponseItem) => ({
    journalId: item.journalId,
    courseName: item.name,
    lineId: item.line.id,
    placeCount: item.placeCount,
    travelDuration: item.travelDuration,
    tags: item.tags,
    imageUrl: item.imageUrl,
  }));
}
