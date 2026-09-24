export type ContentReportReason =
  | "ABUSIVE_CONTENT"
  | "SPAM_AD"
  | "HATE_OR_OFFENSIVE"
  | "IRRELEVANT";

export type ProfileReportReason =
  | "ABUSIVE"
  | "SPAM"
  | "IMPERSONATION"
  | "INAPPROPRIATE_PROFILE";

export interface ContentReportRequest {
  targetId: number;
  reason: ContentReportReason;
  description?: string;
}

export interface ProfileReportRequest {
  targetId: number;
  reason: ProfileReportReason;
  description?: string;
}
