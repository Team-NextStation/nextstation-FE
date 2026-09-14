import { fetchWithRequiredAuth, getAccessToken } from "@/api/auth";

import { API_BASE_URL } from "@/api/config";

export type ImageFolder = "JOURNAL" | "PROFILE";

export interface PresignedUrlItem {
  presignedUrl: string;
  imageUrl: string;
  contentType: string;
}

export interface GetPresignedUrlRequest {
  folder: ImageFolder;
  journalId?: number;
  fileName: string;
}

export interface GetPresignedUrlsBatchRequest {
  folder: ImageFolder;
  journalId?: number;
  fileNames: string[];
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

// 단일 발급
export async function getPresignedUrl(
  body: GetPresignedUrlRequest,
): Promise<PresignedUrlItem> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const response = await fetchWithRequiredAuth(`${API_BASE_URL}/api/v1/images/presigned-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    throw new Error(errorJson?.message ?? "이미지 업로드 URL 발급에 실패했습니다.");
  }

  const json: ApiResponse<PresignedUrlItem> = await response.json();
  return json.data;
}

// 다중 발급
export async function getPresignedUrlsBatch(
  body: GetPresignedUrlsBatchRequest,
): Promise<PresignedUrlItem[]> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/images/presigned-urls/batch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    throw new Error(errorJson?.message ?? "다중 이미지 업로드 URL 발급에 실패했습니다.");
  }

  const json: ApiResponse<PresignedUrlItem[]> = await response.json();
  return json.data;
}

// 사진 업로드 함수
export async function uploadFileToPresignedUrl(
  presignedUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("이미지 업로드에 실패했습니다.");
  }
}

// 이미지 삭제
export async function deleteImage(imageUrl: string): Promise<void> {
  if (!getAccessToken()) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/images?imageUrl=${encodeURIComponent(imageUrl)}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    throw new Error(errorJson?.message ?? "이미지 삭제에 실패했습니다.");
  }
}

// 파일명 중복 방지용
export function createUploadFileName(file: File) {
  const extension = file.name.split(".").pop() ?? "jpg";
  return `${crypto.randomUUID()}.${extension}`;
}
