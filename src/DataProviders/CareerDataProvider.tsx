/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import type { CareerRow } from "../services/careerDataTypes";
import { CareerDataContext } from "../contexts/CareerDataContext";

interface Props {
  children: React.ReactNode;
}


const Read_Career_Info = import.meta.env.VITE_SHEET_READ_URL;


export const CareerDataProvider: React.FC<Props> = ({ children }) => {
  const [careerData, setCareerData] = useState<CareerRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
      const fetchCareerData = async () => {
        try {
          setLoading(true);
          setError(null);
    
          const res = await fetch(
            `${Read_Career_Info}?action=career`
          );
    
          if (!res.ok) {
            throw new Error("Failed to load career data");
          }
    
          const data = await res.json();
          // Optional: ensure array safety
          setCareerData(data.data);
        } catch (err: any) {
          setError(err.message || "Unknown error");
        } finally {
          setLoading(false);
        }
      };
    fetchCareerData();
  }, []);


  return (
    <CareerDataContext.Provider
      value={{
        careerData,
        setCareerData,
        loading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </CareerDataContext.Provider>
  );
};