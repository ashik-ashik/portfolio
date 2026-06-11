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

  // ─────────────────────────────────────────────────────────────────────────
  // Centralized authenticated fetcher
  // Apps Script only reads e.parameter (not headers), so the JWT is passed
  // as a query-param: ?getToken=<jwt>
  // ─────────────────────────────────────────────────────────────────────────
  const authFetch = useCallback(
    async (url: string): Promise<Response> => {
      if (!getToken) throw new Error("Unauthorized: No getToken available");

      const separator = url.includes("?") ? "&" : "?";
      const secureUrl = `${url}${separator}getToken=${getToken}`;

      const res = await fetch(secureUrl);

      if (res.status === 401) {
        logout();
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
  // PUBLIC fetch — available to ALL users (logged-in or not)
  // Runs once on mount regardless of auth state
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);

        const availableJobDataRES = await fetch(
          `${Read_Career_Info}?action=getAvailableJobs`
        );
        const availableJobDataData = await availableJobDataRES.json();
        setAvailableJobData(availableJobDataData.data);
      } catch (err: any) {
        console.error("Failed to fetch public job data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []); // no auth dependency — runs for everyone

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE fetch — only runs when user is authenticated
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!getToken || !currentUserInfo) return;

    const fetchPrivateData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ── Career Info ──────────────────────────────────────────────────
        const CareerDataRES = await authFetch(
          `${Read_Career_Info}?action=career&user=${currentUserInfo.Role}&&${import.meta.env.VITE_ASH_TOKEN}`
        );
        const CareerData = await CareerDataRES.json();
        setCareerData(CareerData.data);

        // ── Personal Info ────────────────────────────────────────────────
        const PersonalDataRES = await authFetch(
          `${Read_Personal_Info}?action=personal&&${import.meta.env.VITE_ASH_TOKEN}`
        );
        const PersonalData = await PersonalDataRES.json();
        setPersonal(PersonalData.data);

        // ── Academic Info ────────────────────────────────────────────────
        const AcademicDataRES = await authFetch(
          `${Read_Personal_Info}?action=academic&&${import.meta.env.VITE_ASH_TOKEN}`
        );
        const AcademicData = await AcademicDataRES.json();
        setAcademic(AcademicData.data);

        // ── Certificates ─────────────────────────────────────────────────
        const CertificatesDataRES = await authFetch(
          `${Read_Personal_Info}?action=certificates&&${import.meta.env.VITE_ASH_TOKEN}`
        );
        const CertificatesData = await CertificatesDataRES.json();
        setCertificates(CertificatesData.data);

      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPrivateData();
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