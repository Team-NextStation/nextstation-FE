import { Capacitor } from "@capacitor/core";

const PUBLIC_SHARE_ORIGIN = "https://www.nextstation.kr";

export function buildSharedCoursePath(shareToken: string) {
  return `/course/share/${shareToken}/verify`;
}

export function buildSharedCourseUrl(
  shareToken: string,
  origin =
    typeof window !== "undefined" && !Capacitor.isNativePlatform()
      ? window.location.origin
      : PUBLIC_SHARE_ORIGIN,
) {
  const normalizedOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;

  return `${normalizedOrigin}${buildSharedCoursePath(shareToken)}`;
}
