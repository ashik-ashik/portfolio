/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import type { CareerRow, AcademicRow, PersonalRow, CertificatesRow } from "../services/careerDataTypes";
import { CareerDataContext } from "../contexts/CareerDataContext";
import useAuth from "../hooks/useAuth";

interface Props {
  children: React.ReactNode;
}


const Read_Career_Info = import.meta.env.VITE_CAREER_SHEET_READ_WRITE_API_URL;
const Read_Personal_Info = import.meta.env.VITE_READ_PERSONAL_INFO_URL;


export const CareerDataProvider: React.FC<Props> = ({ children }) => {
  const [careerData, setCareerData] = useState<CareerRow[]>([]);
  const [Personal, setPersonal] = useState<PersonalRow[]>([]);
  const [Academic, setAcademic] = useState<AcademicRow[]>([]);
  const [Certificates, setCertificates] = useState<CertificatesRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const {currentUserInfo} = useAuth();

  // console.log()

  
  useEffect(() => {
      const fetchCareerData = async () => {
        try {

          
          setLoading(true);
          setError(null);
    // ############################################################################
          // Read Career Info
    // ############################################################################
          const CareerDataRES = await fetch(
            `${Read_Career_Info}?action=career&user${currentUserInfo?.Role}`
          );
    
          if (!CareerDataRES.ok) {
            throw new Error("Failed to load career data");
          }
    
          const CareerData = await CareerDataRES.json();
          // Optional: ensure array safety
          setCareerData(CareerData.data);

    // ############################################################################
          // Read Personal info Personal
    // ############################################################################
          const PersonalDataRES = await fetch(
            `${Read_Personal_Info}?action=personal`
          );
    
          if (!PersonalDataRES.ok) {
            throw new Error("Failed to load career data");
          }
    
          const PersonalData = await PersonalDataRES.json();
          // Optional: ensure array safety
          
          setPersonal(PersonalData.data);

    // ############################################################################
          // Read Personal info ACADEMIC
    // ############################################################################
          const AcademicDataRES = await fetch(
            `${Read_Personal_Info}?action=academic`
          );
    
          if (!AcademicDataRES.ok) {
            throw new Error("Failed to load career data");
          }
    
          const AcademicData = await AcademicDataRES.json();
          // Optional: ensure array safety
          setAcademic(AcademicData.data);

    // ############################################################################
          // Read Personal info Certificates
    // ############################################################################
          const CertificatesDataRES = await fetch(
            `${Read_Personal_Info}?action=certificates`
          );
    
          if (!CertificatesDataRES.ok) {
            throw new Error("Failed to load career data");
          }
    
          const CertificatesData = await CertificatesDataRES.json();
          // Optional: ensure array safety
          setCertificates(CertificatesData.data);





        } catch (err: any) {
          setError(err.message || "Unknown error");
        } finally {
          setLoading(false);
        }
      };






    fetchCareerData();
  }, [currentUserInfo]);


  return (
    <CareerDataContext.Provider
      value={{
        careerData,
        Academic,
        Personal,
        Certificates,
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