export type SummaryResult = {
  filename: string;
  document_type: "pdf" | "image";
  summary: { short: string; medium: string; long: string };
  key_points: string[];
  improvements: string[];
  processing_notice?: string | null;
};