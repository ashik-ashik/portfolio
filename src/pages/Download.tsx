/* eslint-disable no-useless-assignment */
import { useState, useEffect, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";

// ── CONFIG ─────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_READ_WRITE_DOWNLOADABLE_FILES as string;
const ADD_FILE_FORM_URL = "https://forms.gle/qSFa2RFuDcREWBfz7";

// ── Types ──────────────────────────────────────────────────────────────────
interface FileRecord {
  rowIndex: number; // 1-based sheet row number returned by backend
  timestamp: string;
  title: string;
  fileUrl: string;
  status: string;
}

type SortField = "timestamp" | "title" | "status";
type SortDir = "asc" | "desc";
type ViewMode = "grid" | "list";

// ── Helpers ────────────────────────────────────────────────────────────────
function extractFileId(url: string): string | null {
  const m = url.match(/\/d\/([-\w]{25,})/);
  if (m) return m[1];
  const m2 = url.match(/id=([-\w]{25,})/);
  if (m2) return m2[1];
  return null;
}

function getPreviewUrl(url: string): string {
  const id = extractFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : url;
}

function getThumbnailUrl(url: string): string | null {
  const id = extractFileId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w400` : null;
}

function statusStyle(s: string): string {
  if (s === "Printed")
    return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
  if (s === "Unprinted")
    return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
  if (!s)
    return "bg-slate-600/30 text-slate-400 border border-slate-600/40";
  return "bg-sky-500/20 text-sky-300 border border-sky-500/30";
}

function statusDotStyle(s: string): string {
  if (s === "Printed") return "bg-emerald-400";
  if (s === "Unprinted") return "bg-amber-400";
  if (!s) return "bg-slate-500";
  return "bg-sky-400";
}

function formatTs(ts: string): string {
  try {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

// ── Toast ──────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type: "success" | "error" | "loading";
  onDismiss: () => void;
}

function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    if (type !== "loading") {
      const t = setTimeout(onDismiss, 3500);
      return () => clearTimeout(t);
    }
  }, [type, onDismiss]);

  const colors = {
    success: "border-emerald-500/40 bg-emerald-900/40 text-emerald-200",
    error: "border-red-500/40 bg-red-900/40 text-red-200",
    loading: "border-violet-500/40 bg-violet-900/30 text-violet-200",
  };

  const icons = {
    success: (
      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    loading: (
      <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin flex-shrink-0" />
    ),
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-2xl text-sm font-medium max-w-xs animate-in ${colors[type]}`}
      style={{ animation: "slideUp 0.2s ease-out" }}
    >
      {icons[type]}
      <span>{message}</span>
      {type !== "loading" && (
        <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center gap-3 py-24">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      <span className="text-slate-400 text-sm tracking-wider font-mono">FETCHING FILES…</span>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-slate-400 text-sm">
        {query ? `No files match "${query}"` : "No pending files — all done!"}
      </p>
    </div>
  );
}

// ── Admin Mark-Printed Confirm ─────────────────────────────────────────────
interface MarkPrintedConfirmProps {
  file: FileRecord;
  onConfirm: () => void;
  onCancel: () => void;
  updating: boolean;
}

function MarkPrintedConfirm({ file, onConfirm, onCancel, updating }: MarkPrintedConfirmProps) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && !updating && onCancel()}
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
        {/* Admin badge */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-violet-400 tracking-wider uppercase">Admin Action</span>
        </div>

        <h3 className="text-white font-semibold text-base mb-1">Mark as Printed?</h3>
        <p className="text-slate-400 text-sm mb-1 leading-relaxed">
          This will update the status of:
        </p>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 mb-5">
          <p className="text-slate-200 font-medium text-sm truncate">{file.title}</p>
          <p className="text-slate-500 text-xs mt-0.5 font-mono">{formatTs(file.timestamp)}</p>
        </div>

        <div className="bg-amber-900/20 border border-amber-500/25 rounded-xl px-3 py-2 mb-5">
          <p className="text-amber-300 text-xs flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            File will be removed from the pending list after update.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={updating}
            className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 text-sm font-medium transition-all disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={updating}
            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Printed
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preview Modal ──────────────────────────────────────────────────────────
interface PreviewModalProps {
  file: FileRecord;
  isAdmin: boolean;
  onClose: () => void;
  onPrint: (file: FileRecord) => void;
  onMarkPrinted: (file: FileRecord) => void;
}

function PreviewModal({ file, isAdmin, onClose, onPrint, onMarkPrinted }: PreviewModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-5xl flex flex-col overflow-hidden shadow-2xl"
        style={{ height: "clamp(400px, 90vh, 920px)", borderRadius: "20px", border: "1px solid rgba(71,85,105,0.5)", background: "#0c0e1a" }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b"
          style={{ borderColor: "rgba(51,65,85,0.5)", background: "rgba(15,20,35,0.8)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate leading-tight">{file.title}</p>
              <p className="text-slate-500 text-xs mt-0.5 font-mono">{formatTs(file.timestamp)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusStyle(file.status)}`}>
              {file.status || "Unknown"}
            </span>

            {/* Print */}
            <button
              onClick={() => onPrint(file)}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>

            {/* Admin: Mark Printed */}
            {isAdmin && file.status !== "Printed" && (
              <button
                onClick={() => onMarkPrinted(file)}
                className="flex items-center gap-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/40"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mark Printed
              </button>
            )}

            {/* Open in Drive */}
            <a
              href={file.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Drive
            </a>

            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* iframe */}
        <div className="flex-1 relative" style={{ background: "#050709" }}>
          <iframe
            src={getPreviewUrl(file.fileUrl)}
            title={file.title}
            className="w-full h-full border-0"
            allow="autoplay"
          />
          <div
            className="absolute bottom-3 right-3 text-xs font-mono px-2 py-1 rounded-md"
            style={{ color: "rgba(100,116,139,0.7)", background: "rgba(5,7,9,0.8)" }}
          >
            ESC to close
          </div>
        </div>
      </div>
    </div>
  );
}

// ── File Card ──────────────────────────────────────────────────────────────
interface FileCardProps {
  file: FileRecord;
  isAdmin: boolean;
  viewMode: ViewMode;
  updating: boolean;
  onPreview: (f: FileRecord) => void;
  onPrint: (f: FileRecord) => void;
  onMarkPrinted: (f: FileRecord) => void;
}

function FileCard({ file, isAdmin, viewMode, updating, onPreview, onPrint, onMarkPrinted }: FileCardProps) {
  const [hovered, setHovered] = useState(false);
  const thumbUrl = getThumbnailUrl(file.fileUrl);

  if (viewMode === "list") {
    return (
      <div
        className={`group flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer ${
          hovered ? "bg-slate-800/80 border-violet-500/35" : "bg-slate-800/25 border-slate-700/35"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onPreview(file)}
      >
        {/* Thumb */}
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/40 overflow-hidden flex-shrink-0">
          {thumbUrl ? (
            <img
        src={`${thumbUrl}#toolbar=0&navpanes=0&scrollbar=0`}
        title={file.title}
        className="w-[50px] h-full pointer-events-none"
        loading="lazy"
      />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-slate-200 font-semibold text-sm truncate">{file.title}</p>
          <p className="text-slate-500 text-xs mt-0.5 font-mono">{formatTs(file.timestamp)}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusStyle(file.status)}`}>
            {file.status || "–"}
          </span>

          {isAdmin && file.status !== "Printed" && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkPrinted(file); }}
              disabled={updating}
              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-emerald-700/70 hover:bg-emerald-600 border border-emerald-500/35 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-30"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Printed
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onPrint(file); }}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-violet-600/70 hover:bg-violet-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div
      className="group relative rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        background: hovered ? "rgba(22,25,45,0.96)" : "rgba(10,12,22,0.65)",
        borderColor: hovered ? "rgba(139,92,246,0.45)" : "rgba(71,85,105,0.4)",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 16px 40px rgba(109,40,217,0.2)" : "none",
        transition: "all 0.18s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPreview(file)}
    >
      {/* Thumbnail */}
      <div className="relative h-36 border-b" style={{ background: "#080b18", borderColor: "rgba(51,65,85,0.4)" }}>
        {thumbUrl ? (
          <img
        src={`${thumbUrl}#toolbar=0&navpanes=0&scrollbar=0`}
        title={file.title}
        className="absolute inset-0 w-full h-full pointer-events-none"
        loading="lazy"
      />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
          style={{ background: "rgba(60,20,120,0.55)", opacity: hovered ? 1 : 0 }}
        >
          <span className="text-white text-xs font-semibold flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </span>
        </div>

        {/* Status badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`text-xs px-2 py-1 rounded-full font-semibold backdrop-blur-sm ${statusStyle(file.status)}`}>
            {file.status || "–"}
          </span>
        </div>

        {/* Admin badge top-left */}
        {isAdmin && (
          <div className="absolute top-2.5 left-2.5">
            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold bg-violet-600/50 text-violet-200 border border-violet-500/40 backdrop-blur-sm">
              ADM
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-3.5 pt-3 pb-1.5">
        <p className="text-slate-200 font-semibold text-sm leading-snug line-clamp-2 mb-1">{file.title}</p>
        <p className="text-slate-500 text-xs font-mono">{formatTs(file.timestamp)}</p>
      </div>

      {/* Footer */}
      <div className="px-3.5 pb-3.5 flex items-center gap-2 mt-2">
        {/* Print */}
        <button
          onClick={(e) => { e.stopPropagation(); onPrint(file); }}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg border transition-all"
          style={{ background: "rgba(109,40,217,0.18)", borderColor: "rgba(109,40,217,0.35)", color: "#c4b5fd" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(109,40,217,0.5)"; e.currentTarget.style.color = "#ede9fe"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(109,40,217,0.18)"; e.currentTarget.style.color = "#c4b5fd"; }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>

        {/* Mark Printed (admin only) */}
        {isAdmin && file.status !== "Printed" && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkPrinted(file); }}
            disabled={updating}
            title="Mark as Printed"
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all disabled:opacity-30"
            style={{ background: "rgba(5,150,105,0.2)", borderColor: "rgba(16,185,129,0.35)", color: "#6ee7b7" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(5,150,105,0.5)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(5,150,105,0.2)"; e.currentTarget.style.color = "#6ee7b7"; }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}

        {/* Open in Drive */}
        <a
          href={file.fileUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all"
          style={{ background: "rgba(51,65,85,0.35)", borderColor: "rgba(71,85,105,0.35)", color: "#64748b" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#cbd5e1"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748b"; }}
          title="Open in Drive"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// ── Stats bar ──────────────────────────────────────────────────────────────
function StatsBar({ files, isAdmin }: { files: FileRecord[]; isAdmin: boolean }) {
  const counts = files.reduce<Record<string, number>>((acc, f) => {
    const s = f.status || "Unknown";
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="text-xs font-mono" style={{ color: "#64748b" }}>
        <span className="text-violet-300 font-bold text-sm">{files.length}</span> files
      </div>
      {Object.entries(counts).map(([s, c]) => (
        <div key={s} className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${statusDotStyle(s)}`} />
          <span className="text-slate-400 text-xs">{c} {s}</span>
        </div>
      ))}
      {isAdmin ? (<>
        <Link to='/' className="ml-auto"><div className=" flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-violet-600/15 border border-violet-500/30 text-violet-300 font-semibold">
          <AiOutlineHome size={16} />
          Back Home
        </div>
        </Link>
      </>
      ):(
        <>
        <Link to='/' className="ml-auto"><div className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-violet-600/15 border border-violet-500/30 text-violet-300 font-semibold">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Back Home
        </div>
        </Link>
        </>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function FileVault() {
  const { currentUserInfo, userIsLoading } = useAuth();
  const isAdmin =
    !userIsLoading &&
    currentUserInfo?.Role === import.meta.env.VITE_ASH_ADMIN_SECRET_ROLE;

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [preview, setPreview] = useState<FileRecord | null>(null);
  const [confirmFile, setConfirmFile] = useState<FileRecord | null>(null);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "loading" } | null>(null);

  // Fetch
  const fetchFiles = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: FileRecord[]) => { setFiles(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => { 
    const helperfetfiles = () => {
        fetchFiles(); 
    }
    helperfetfiles ();
}, [fetchFiles]);

  // Print without download
  const handlePrint = useCallback((file: FileRecord) => {
    const id = extractFileId(file.fileUrl);
    if (!id) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;";
    iframe.src = `https://drive.google.com/file/d/${id}/preview`;
    iframe.onload = () => {
      try { iframe.contentWindow?.print(); }
      catch { window.open(`https://drive.google.com/file/d/${id}/view`, "_blank"); }
      setTimeout(() => document.body.removeChild(iframe), 3000);
    };
    document.body.appendChild(iframe);
  }, []);

  // Mark as Printed — calls backend POST
  const handleMarkPrinted = useCallback(async (file: FileRecord) => {
    if (!isAdmin) return;
    setUpdating(true);
    setToast({ msg: "Updating status…", type: "loading" });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markPrinted", rowIndex: file.rowIndex }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Update failed");
      // Optimistically remove from local state
      setFiles((prev) => prev.filter((f) => f.rowIndex !== file.rowIndex));
      setConfirmFile(null);
      if (preview?.rowIndex === file.rowIndex) setPreview(null);
      setToast({ msg: `"${file.title}" marked as Printed ✓`, type: "success" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setToast({ msg: `Failed: ${msg}`, type: "error" });
    } finally {
      setUpdating(false);
    }
  }, [isAdmin, preview]);

  // Sort + filter
  const allStatuses = Array.from(new Set(files.map((f) => f.status || "Unknown")));

  const visible = files
    .filter((f) => {
      const q = search.toLowerCase();
      const matchSearch = !q || f.title.toLowerCase().includes(q) || f.status.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || (f.status || "Unknown") === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "timestamp") cmp = a.timestamp.localeCompare(b.timestamp);
      else if (sortField === "title") cmp = a.title.localeCompare(b.title);
      else cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField !== field ? (
      <span style={{ color: "#475569" }}>↕</span>
    ) : (
      <span style={{ color: "#a78bfa" }}>{sortDir === "asc" ? "↑" : "↓"}</span>
    );

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        background: "linear-gradient(135deg,#06080f 0%,#0b0d1c 45%,#080c16 100%)",
        fontFamily: "'DM Sans','Inter',system-ui,sans-serif",
      }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full opacity-[0.09]"
          style={{ background: "radial-gradient(ellipse,#7c3aed 0%,transparent 70%)" }} />
        {isAdmin && (
          <div className="absolute top-0 right-0 w-[400px] h-[250px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(ellipse,#059669 0%,transparent 70%)" }} />
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(124,58,237,0.18)", border: "1px solid rgba(139,92,246,0.35)" }}>
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  File<span className="text-violet-400">Vault</span>
                </h1>
              </div>
            </div>
            <p className="text-slate-500 text-sm ml-12">Pending print queue — excludes Printed files</p>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={ADD_FILE_FORM_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.5)"; (e.currentTarget as HTMLElement).style.color = "#ede9fe"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.25)"; (e.currentTarget as HTMLElement).style.color = "#c4b5fd"; }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add File
              </a>
              <button
                onClick={fetchFiles}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all disabled:opacity-40"
                style={{ background: "rgba(51,65,85,0.4)", border: "1px solid rgba(71,85,105,0.4)", color: "#94a3b8" }}
              >
                <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none transition-all"
              style={{ background: "rgba(30,35,55,0.55)", border: "1px solid rgba(71,85,105,0.5)", borderRadius: "12px", color: "#cbd5e1" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.55)"; e.currentTarget.style.background = "rgba(30,35,55,0.9)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(71,85,105,0.5)"; e.currentTarget.style.background = "rgba(30,35,55,0.55)"; }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2.5 px-3 text-sm focus:outline-none cursor-pointer transition-all"
            style={{ background: "rgba(30,35,55,0.55)", border: "1px solid rgba(71,85,105,0.5)", borderRadius: "12px", color: "#cbd5e1" }}
          >
            <option value="all">All statuses</option>
            {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1 px-2 py-1" style={{ background: "rgba(30,35,55,0.55)", border: "1px solid rgba(71,85,105,0.5)", borderRadius: "12px" }}>
            {(["timestamp", "title", "status"] as SortField[]).map((f) => (
              <button
                key={f}
                onClick={() => toggleSort(f)}
                className="px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all capitalize flex items-center gap-1"
                style={{
                  background: sortField === f ? "rgba(109,40,217,0.3)" : "transparent",
                  color: sortField === f ? "#c4b5fd" : "#64748b",
                }}
              >
                {f} <SortIcon field={f} />
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1" style={{ background: "rgba(30,35,55,0.55)", border: "1px solid rgba(71,85,105,0.5)", borderRadius: "12px" }}>
            {(["grid", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                style={{
                  background: viewMode === v ? "rgba(109,40,217,0.35)" : "transparent",
                  color: viewMode === v ? "#c4b5fd" : "#64748b",
                }}
                title={`${v} view`}
              >
                {v === "grid" ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        {!loading && !error && (
          <div className="mb-5">
            <StatsBar files={visible} isAdmin={isAdmin} />
          </div>
        )}

        {/* ── Content ── */}
        {loading && <Spinner />}

        {error && (
          <div className="rounded-2xl border p-6 text-center" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(127,29,29,0.2)" }}>
            <p className="text-red-400 font-medium text-sm mb-1">Failed to load</p>
            <p className="text-red-500/60 text-xs font-mono mb-3">{error}</p>
            <button onClick={fetchFiles} className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2">Try again</button>
          </div>
        )}

        {!loading && !error && visible.length === 0 && <EmptyState query={search} />}

        {!loading && !error && visible.length > 0 && (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {visible.map((f) => (
                <FileCard
                  key={f.rowIndex}
                  file={f}
                  isAdmin={isAdmin}
                  viewMode="grid"
                  updating={updating}
                  onPreview={setPreview}
                  onPrint={handlePrint}
                  onMarkPrinted={setConfirmFile}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visible.map((f) => (
                <FileCard
                  key={f.rowIndex}
                  file={f}
                  isAdmin={isAdmin}
                  viewMode="list"
                  updating={updating}
                  onPreview={setPreview}
                  onPrint={handlePrint}
                  onMarkPrinted={setConfirmFile}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Preview Modal ── */}
      {preview && (
        <PreviewModal
          file={preview}
          isAdmin={isAdmin}
          onClose={() => setPreview(null)}
          onPrint={handlePrint}
          onMarkPrinted={(f) => { setPreview(null); setConfirmFile(f); }}
        />
      )}

      {/* ── Admin Confirm Modal ── */}
      {confirmFile && (
        <MarkPrintedConfirm
          file={confirmFile}
          onConfirm={() => handleMarkPrinted(confirmFile)}
          onCancel={() => setConfirmFile(null)}
          updating={updating}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      {/* Slide-up animation keyframe */}
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}