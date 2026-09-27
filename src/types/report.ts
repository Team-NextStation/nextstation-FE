export type ReportTargetType = "JOURNAL" | "PLACE_REVIEW" | "PROFILE";

export type ContentReportReason =
  | "ABUSIVE_CONTENT"
  | "SPAM_AD"
  | "HATE_OR_OFFENSIVE"
  | "IRRELEVANT";

export type ProfileReportReason =
  | "ABUSIVE_CONTENT"
  | "SPAM_AD"
  | "IMPERSONATION"
  | "INAPPROPRIATE_PROFILE";

export interface ReportRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: ContentReportReason | ProfileReportReason;
}
