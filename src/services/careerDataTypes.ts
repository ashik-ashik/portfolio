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

export interface PersonalRow {
  Title: string;
  Information: string;
}
export interface CertificatesRow {
  Title: string;
  Institute: string;
  Year: number;
  Topics: string;
  Description: string;
  Duration: string;
  FileId: string;
}


export interface AcademicRow {
Level: string;
Board: string;
InstituteName: string;
Roll: string;
Registration: string;
StudentID: string;
PassingYear: string;
ResultPublishDate: string;
Result: string;
MajorGroup: string;
}