import { API_BASE_URL } from "@/api/config";

const AGREED_TERMS_STORAGE_KEY = "auth.agreedTermsIds";
const REQUIRED_TERMS_AGREED_STORAGE_KEY = "auth.requiredTermsAgreed";
const SIGNUP_TOKEN_STORAGE_KEY = "auth.signupToken";
const ACCESS_TOKEN_STORAGE_KEY = "auth.accessToken";
const KAKAO_SIGNUP_TOKEN_STORAGE_KEY = "auth.kakaoSignupToken";
const KAKAO_PROFILE_STORAGE_KEY = "auth.kakaoProfile";
const KAKAO_OAUTH_STATE_STORAGE_KEY = "auth.kakaoOAuthState";
const ACCESS_TOKEN_CHANGED_EVENT = "auth:access-token-changed";
const ROLE_STORAGE_KEY = "auth.role";

export type AuthTermType = "SERVICE" | "PRIVACY" | "MARKETING";

export interface AuthTerm {
  id: number;
  type: AuthTermType;
  title: string;
  version: string;
  isRequired: boolean;
}

export interface AuthTermDetail extends AuthTerm {
  content: string;
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  code: string;
  message: string;
  data: T;
  reasons?: Record<string, string>;
}

export class AuthApiError extends Error {
  status: number;
  code: string;
  reasons?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    reasons?: Record<string, string>,
  ) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.code = code;
    this.reasons = reasons;
  }
}

async function authRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new AuthApiError(
      response.status,
      body.code,
      body.message || "요청을 처리하지 못했습니다.",
      body.reasons,
    );
  }

  return body.data;
}

export function saveAgreedTermsIds(ids: number[], requiredTermsAgreed = false) {
  sessionStorage.setItem(AGREED_TERMS_STORAGE_KEY, JSON.stringify(ids));
  sessionStorage.setItem(
    REQUIRED_TERMS_AGREED_STORAGE_KEY,
    String(requiredTermsAgreed),
  );
}

export function getAgreedTermsIds(): number[] {
  const storedIds = sessionStorage.getItem(AGREED_TERMS_STORAGE_KEY);

  if (!storedIds) {
    return [];
  }

  try {
    const ids: unknown = JSON.parse(storedIds);
    return Array.isArray(ids)
      ? ids.filter((id): id is number => typeof id === "number")
      : [];
  } catch {
    return [];
  }
}

export function saveSignupToken(token: string) {
  sessionStorage.setItem(SIGNUP_TOKEN_STORAGE_KEY, token);
}

export function hasAgreedToRequiredTerms() {
  return sessionStorage.getItem(REQUIRED_TERMS_AGREED_STORAGE_KEY) === "true";
}

export function getSignupToken() {
  return sessionStorage.getItem(SIGNUP_TOKEN_STORAGE_KEY);
}

export function clearSignupFlow() {
  sessionStorage.removeItem(AGREED_TERMS_STORAGE_KEY);
  sessionStorage.removeItem(REQUIRED_TERMS_AGREED_STORAGE_KEY);
  sessionStorage.removeItem(SIGNUP_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(KAKAO_SIGNUP_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(KAKAO_PROFILE_STORAGE_KEY);
}

export function saveAccessToken(token: string) {
  sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  notifyAccessTokenChanged(token);
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function clearAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  notifyAccessTokenChanged(null);
  clearRole();
}

let reissueAccessTokenPromise: Promise<string> | null = null;

function notifyAccessTokenChanged(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<string | null>(ACCESS_TOKEN_CHANGED_EVENT, {
      detail: token,
    }),
  );
}

function createAuthHeaders(
  headers: HeadersInit | undefined,
  accessToken: string,
) {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  return nextHeaders;
}

async function requestAccessTokenReissue() {
  if (!reissueAccessTokenPromise) {
    reissueAccessTokenPromise = reissueAccessToken()
      .then(({ accessToken, role }) => {
        saveAccessToken(accessToken);
        saveRole(role);
        return accessToken;
      })
      .finally(() => {
        reissueAccessTokenPromise = null;
      });
  }

  return reissueAccessTokenPromise;
}

export async function restoreAccessToken() {
  const accessToken = getAccessToken();

  if (accessToken) {
    return accessToken;
  }

  try {
    return await requestAccessTokenReissue();
  } catch {
    clearAccessToken();
    return null;
  }
}

export function subscribeToAccessTokenChange(
  listener: (token: string | null) => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleAccessTokenChanged = (event: Event) => {
    listener((event as CustomEvent<string | null>).detail);
  };

  window.addEventListener(ACCESS_TOKEN_CHANGED_EVENT, handleAccessTokenChanged);

  return () => {
    window.removeEventListener(
      ACCESS_TOKEN_CHANGED_EVENT,
      handleAccessTokenChanged,
    );
  };
}

// USER | ADMIN
export function saveRole(role: string) {
  sessionStorage.setItem(ROLE_STORAGE_KEY, role);
}

export function getRole() {
  return sessionStorage.getItem(ROLE_STORAGE_KEY);
}

export function clearRole() {
  sessionStorage.removeItem(ROLE_STORAGE_KEY);
}

export async function fetchWithRequiredAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const accessToken = await restoreAccessToken();

  if (!accessToken) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  const send = (token: string) =>
    fetch(input, {
      ...init,
      headers: createAuthHeaders(init.headers, token),
    });

  const response = await send(accessToken);

  if (response.status !== 401) {
    return response;
  }

  try {
    const nextAccessToken = await requestAccessTokenReissue();
    return await send(nextAccessToken);
  } catch {
    clearAccessToken();
    return response;
  }
}

export async function fetchWithOptionalAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return fetch(input, init);
  }

  const sendWithToken = (token: string) =>
    fetch(input, {
      ...init,
      headers: createAuthHeaders(init.headers, token),
    });

  const response = await sendWithToken(accessToken);

  if (response.status !== 401) {
    return response;
  }

  try {
    const nextAccessToken = await requestAccessTokenReissue();
    return await sendWithToken(nextAccessToken);
  } catch {
    clearAccessToken();
    return fetch(input, init);
  }
}

export function getTerms() {
  return authRequest<AuthTerm[]>("/api/v1/auth/terms", { cache: "no-store" });
}

export function getTerm(type: AuthTermType) {
  return authRequest<AuthTermDetail>(`/api/v1/auth/terms/${type}`, {
    cache: "no-store",
  });
}

export function createKakaoOAuthState() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const state = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  sessionStorage.setItem(KAKAO_OAUTH_STATE_STORAGE_KEY, state);
  return state;
}

export function getKakaoOAuthState() {
  return sessionStorage.getItem(KAKAO_OAUTH_STATE_STORAGE_KEY);
}

export function clearKakaoOAuthState() {
  sessionStorage.removeItem(KAKAO_OAUTH_STATE_STORAGE_KEY);
}

export function getKakaoRedirectUri() {
  return (
    import.meta.env.VITE_KAKAO_REDIRECT_URI ??
    `${window.location.origin}/auth/kakao/callback`
  );
}

export function sendEmailVerification(email: string, agreedTermsIds: number[]) {
  return authRequest<string>("/api/v1/auth/email/verification", {
    method: "POST",
    body: JSON.stringify({ email, agreedTermsIds }),
  });
}

export function confirmEmailVerification(email: string, code: string) {
  return authRequest<string>("/api/v1/auth/email/verification/confirm", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

interface SignupResponse {
  memberId: number;
  signupToken: string;
}

export function signup(
  email: string,
  password: string,
  passwordConfirm: string,
  agreedTermsIds: number[],
) {
  return authRequest<SignupResponse>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      passwordConfirm,
      agreedTermsIds,
    }),
  });
}

interface ProfileResponse {
  memberId: number;
  nickname: string;
  status: "ACTIVE";
  accessToken: string;
}

interface PresignedImageResponse {
  presignedUrl: string;
  imageUrl: string;
  contentType: string;
}

export class ProfileImageUploadError extends Error {
  constructor() {
    super("프로필 사진 업로드에 실패했습니다.");
    this.name = "ProfileImageUploadError";
  }
}

export function getProfileImagePresignedUrl(
  signupToken: string,
  fileName: string,
) {
  return authRequest<PresignedImageResponse>("/api/v1/images/presigned-url", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${signupToken}`,
    },
    body: JSON.stringify({
      folder: "PROFILE",
      journalId: null,
      fileName,
    }),
  });
}

export async function uploadProfileImage(
  presignedUrl: string,
  file: File,
  contentType: string,
) {
  let response: Response;

  try {
    response = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: file,
    });
  } catch {
    throw new ProfileImageUploadError();
  }

  if (!response.ok) {
    throw new ProfileImageUploadError();
  }
}

export function setupProfile(
  signupToken: string,
  profile: {
    nickname: string;
    profileImageUrl?: string;
    gender: "MALE" | "FEMALE" | "UNSPECIFIED";
    birthDate: string;
  },
) {
  return authRequest<ProfileResponse>("/api/v1/auth/profile", {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${signupToken}`,
    },
    body: JSON.stringify(profile),
  });
}

interface LoginResponse {
  memberId: number;
  accessToken: string;
  role: "USER" | "ADMIN";
}

export function login(email: string, password: string) {
  return authRequest<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function reissueAccessToken() {
  return authRequest<{ accessToken: string; role: "USER" | "ADMIN" }>(
    "/api/v1/auth/reissue",
    {
      method: "POST",
    },
  );
}

export interface KakaoProfileDraft {
  nickname: string;
  profileImageUrl?: string;
}

export function saveKakaoSignupToken(token: string) {
  sessionStorage.setItem(KAKAO_SIGNUP_TOKEN_STORAGE_KEY, token);
}

export function getKakaoSignupToken() {
  return sessionStorage.getItem(KAKAO_SIGNUP_TOKEN_STORAGE_KEY);
}

export function saveKakaoProfile(profile: KakaoProfileDraft) {
  sessionStorage.setItem(KAKAO_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function getKakaoProfile(): KakaoProfileDraft | null {
  const storedProfile = sessionStorage.getItem(KAKAO_PROFILE_STORAGE_KEY);

  if (!storedProfile) {
    return null;
  }

  try {
    return JSON.parse(storedProfile) as KakaoProfileDraft;
  } catch {
    return null;
  }
}

interface KakaoLoginResponse {
  resultType: "LOGIN_SUCCESS" | "PENDING_PROFILE" | "NEW_MEMBER";
  memberId?: number;
  accessToken?: string;
  signupToken?: string;
  kakaoSignupToken?: string;
  kakaoNickname?: string;
  kakaoProfileImageUrl?: string;
  role?: "USER" | "ADMIN";
}

export function kakaoLogin(
  code: string,
  redirectUri: string,
  signal?: AbortSignal,
) {
  return authRequest<KakaoLoginResponse>("/api/v1/auth/kakao/login", {
    method: "POST",
    signal,
    body: JSON.stringify({ code, redirectUri }),
  });
}

export function sendPasswordResetVerification(email: string) {
  return authRequest<string>("/api/v1/auth/password-reset/email/verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function confirmPasswordResetVerification(email: string, code: string) {
  return authRequest<string>(
    "/api/v1/auth/password-reset/email/verification/confirm",
    {
      method: "POST",
      body: JSON.stringify({ email, code }),
    },
  );
}

export function resetPassword(
  email: string,
  code: string,
  newPassword: string,
  newPasswordConfirm: string,
) {
  return authRequest<string>("/api/v1/auth/password-reset", {
    method: "POST",
    body: JSON.stringify({
      email,
      code,
      newPassword,
      newPasswordConfirm,
    }),
  });
}

export function kakaoSignup(
  kakaoSignupToken: string,
  agreedTermsIds: number[],
) {
  return authRequest<SignupResponse>("/api/v1/auth/kakao/signup", {
    method: "POST",
    body: JSON.stringify({ kakaoSignupToken, agreedTermsIds }),
  });
}

// 로그아웃
export async function logout() {
  const accessToken = getAccessToken();

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("로그아웃 실패");
  }
}
