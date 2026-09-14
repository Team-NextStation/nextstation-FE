export interface Review {
  // ReviewListPage에서 사용됨
  reviewId: number;
  writerId: number;
  writerNickname: string;
  writerProfileImageUrl: string;
  content: string;
  imageUrl: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface PlaceReviewResponseItem {
  // 백으로부터의 응답 형태
  totalCount: number;
  reviews: Review[];
  nextCursor: string;
  hasNext: boolean;
}

export interface PlaceReviewListResponse {
  // 프론트에서의 변수 형태
  totalCount: number | null;
  reviews: Review[];
  nextCursor: string | null;
  hasNext: boolean;
}

import {
  fetchWithOptionalAuth,
  fetchWithRequiredAuth,
  getAccessToken,
} from "@/api/auth";

import { API_BASE_URL } from "@/api/config";

// 장소 리뷰 목록 조회
export async function getReviews(
  placeId: number,
  sort: "RECOMMEND" | "LATEST",
  cursor?: string,
): Promise<PlaceReviewListResponse> {
  const response = await fetchWithOptionalAuth(
    `${API_BASE_URL}/api/v1/places/${placeId}/reviews?sort=${sort}&size=10${cursor ? `&cursor=${cursor}` : ""}`,
  );
  if (!response.ok) {
    throw new Error("장소 리뷰 목록 조회 실패");
  }

  const json = await response.json();

  const item: PlaceReviewResponseItem = json.data;

  return {
    totalCount: item.totalCount,
    reviews: item.reviews,
    nextCursor: item.nextCursor,
    hasNext: item.hasNext,
  };
}

// 장소 리뷰 좋아요
export async function createReviewLike(reviewId: number): Promise<void> {
  if (!getAccessToken()) {
    throw new Error("로그인이 필요합니다");
  }

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/places/reviews/${reviewId}/like`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("장소 리뷰 좋아요 실패");
  }
}

// 장소 리뷰 좋아요 취소
export async function deleteReviewLike(reviewId: number): Promise<void> {
  if (!getAccessToken()) {
    throw new Error("로그인이 필요합니다");
  }

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/places/reviews/${reviewId}/like`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("장소 리뷰 좋아요 취소 실패");
  }
}
