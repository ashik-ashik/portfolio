import { createContext } from "react";
import type { CareerRow } from "../services/careerDataTypes";

export interface CareerDataContextType {
  careerData: CareerRow[];
  setCareerData: React.Dispatch<React.SetStateAction<CareerRow[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const CareerDataContext = createContext<
  CareerDataContextType | undefined
>(undefined);