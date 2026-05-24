import { createContext } from "react";
import type { AcademicRow, CareerRow, CertificatesRow, JobCircular, PersonalRow } from "../services/careerDataTypes";

export interface CareerDataContextType {
  careerData: CareerRow[];
  Academic: AcademicRow[];
  Personal: PersonalRow[];
  availableJobData: JobCircular[];
  Certificates: CertificatesRow[];
  setCareerData: React.Dispatch<React.SetStateAction<CareerRow[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const CareerDataContext = createContext<
  CareerDataContextType | undefined
>(undefined);