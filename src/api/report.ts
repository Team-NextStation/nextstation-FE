import { fetchWithRequiredAuth } from "./auth";
import { API_BASE_URL } from "./config";
import type { ReportRequest } from "@/types/report";

// 이미 신고한 대상을 다시 신고한 경우 (409 REPORT_ALREADY_EXISTS)
export class ReportAlreadyExistsError extends Error {
  constructor() {
    super("이미 신고한 대상입니다.");
    this.name = "ReportAlreadyExistsError";
  }
}

// 콘텐츠(여행일지 및 장소 리뷰) 또는 프로필 신고
export async function postReport(request: ReportRequest): Promise<void> {
  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/reports`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (response.status === 409) {
    throw new ReportAlreadyExistsError();
  }

  if (!response.ok) {
    throw new Error("신고 실패");
  }
}
