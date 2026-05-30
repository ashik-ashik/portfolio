/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import type {
  CareerRow,
  AcademicRow,
  PersonalRow,
  CertificatesRow,
  JobCircular,
} from "../services/careerDataTypes";
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
  const [availableJobData, setAvailableJobData] = useState<JobCircular[]>([]);
  const [Academic, setAcademic] = useState<AcademicRow[]>([]);
  const [Certificates, setCertificates] = useState<CertificatesRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { currentUserInfo, getToken, logout } = useAuth();
  // ─── getToken comes from useAuth — single source of truth ───────────────────

  // ─────────────────────────────────────────────────────────────────────────
  // Centralized authenticated fetcher
  // Apps Script only reads e.parameter (not headers), so the JWT is passed
  // as a query-param: ?getToken=<jwt>
  // ─────────────────────────────────────────────────────────────────────────
  const authFetch = useCallback(
    async (url: string): Promise<Response> => {
      if (!getToken) throw new Error("Unauthorized: No getToken available");

      // Append getToken as query param (required for Apps Script)
      const separator = url.includes("?") ? "&" : "?";
      const secureUrl = `${url}${separator}getToken=${getToken}`;

      const res = await fetch(secureUrl);

      if (res.status === 401) {
        logout(); // clear session in useAuth
        throw new Error("Session expired. Please log in again.");
      }

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }

      return res;
    },
    [getToken, logout]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Main data fetch — runs whenever auth state changes
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Don't fetch until we actually have a getToken
    if (!getToken || !currentUserInfo) return;

    const fetchCareerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ── Career Info ────────────────────────────────────────────────────
        const CareerDataRES = await authFetch(
          `${Read_Career_Info}?action=career&user=${currentUserInfo.Role}&&${import.meta.env.VITE_ASH_TOKEN}`
        );
        const CareerData = await CareerDataRES.json();
        setCareerData(CareerData.data);

        // ── Personal Info ──────────────────────────────────────────────────
        const PersonalDataRES = await authFetch(
          `${Read_Personal_Info}?action=personal&&${import.meta.env.VITE_ASH_TOKEN}`
        );
        const PersonalData = await PersonalDataRES.json();
        setPersonal(PersonalData.data);

        // ── Academic Info ──────────────────────────────────────────────────
        const AcademicDataRES = await authFetch(
          `${Read_Personal_Info}?action=academic&&${import.meta.env.VITE_ASH_TOKEN}`
        );
        const AcademicData = await AcademicDataRES.json();
        setAcademic(AcademicData.data);

        // ── Certificates ───────────────────────────────────────────────────
        const CertificatesDataRES = await authFetch(
          `${Read_Personal_Info}?action=certificates&&${import.meta.env.VITE_ASH_TOKEN}`
        );
        const CertificatesData = await CertificatesDataRES.json();
        setCertificates(CertificatesData.data);

        // ── Available Jobs ─────────────────────────────────────────────────
        const availableJobDataRES = await authFetch(
          `${Read_Career_Info}?action=getAvailableJobs&&${import.meta.env.VITE_ASH_TOKEN}`
        );
        const availableJobDataData = await availableJobDataRES.json();
        setAvailableJobData(availableJobDataData.data);

      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCareerData();
  }, [currentUserInfo, getToken, authFetch]);

  return (
    <CareerDataContext.Provider
      value={{
        careerData,
        Academic,
        Personal,
        Certificates,
        availableJobData,
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