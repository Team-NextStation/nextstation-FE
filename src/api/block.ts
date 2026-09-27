import { fetchWithRequiredAuth } from "./auth";
import { API_BASE_URL } from "./config";

// 이미 차단한 사용자를 다시 차단한 경우 (409 ALREADY_BLOCKED)
export class MemberAlreadyBlockedError extends Error {
  constructor() {
    super("이미 차단한 사용자입니다.");
    this.name = "MemberAlreadyBlockedError";
  }
}

// 사용자 차단
export async function postBlockedUser(
  blockedMemberId: number,
): Promise<void> {
  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/members/blocks/${blockedMemberId}`,
    { method: "POST" },
  );

  if (response.status === 409) {
    throw new MemberAlreadyBlockedError();
  }

  if (!response.ok) {
    throw new Error("사용자 차단 실패");
  }
}

// 사용자 차단 해제
export async function deleteBlockedUser(
  blockedMemberId: number,
): Promise<void> {
  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/members/blocks/${blockedMemberId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error("사용자 차단 해제 실패");
  }
}

export interface Member {
  memberId: number;
  nickname: string;
  profileImageUrl: string | null;
  blockedAt: string;
}

export interface BlockedUsers {
  members: Member[];
}

// 차단한 사용자 목록 조회
export async function getBlockedUsers(): Promise<Member[]> {
  const response = await fetchWithRequiredAuth(
    `${API_BASE_URL}/api/v1/members/blocks`,
  );

  if (!response.ok) {
    throw new Error("차단한 사용자 목록 조회 실패");
  }

  const json = await response.json();
  const data = json.data as BlockedUsers;

  return data.members;
}
