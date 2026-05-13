export type ExamStatus = "Done" | "Future" | "Pending" | string;

export interface CareerRow {
  sl?: number | string;
  institute?: string;
  position?: string;
  userId?: string;
  password?: string;
  posts?: string;
  applyDate?: string; // e.g. "20-Nov-2023"
  examStatus?: ExamStatus;

  preliminary?: string; // Qualified / Unqualified / ↔
  written?: string;
  viva?: string;
}