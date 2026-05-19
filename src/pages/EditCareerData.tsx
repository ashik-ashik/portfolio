import { useState, useEffect, useRef } from "react";
import { useCareerData } from "../hooks/useCareerData";

const API_URL = import.meta.env.VITE_CAREER_SHEET_READ_WRITE_API_URL;

type ExamStatus = "Done" | "Future" | "";
type StageResult = "Qualified" | "Unqualified" | "Not Attaint" | "";

interface CareerEntry {
  SL: string;
  Institute: string;
  Position: string;
  UserID: string;
  Password: string;
  Posts: string;
  ApplyDate: string;
  ExamStatus: ExamStatus;
  Preliminary: StageResult;
  Written: StageResult;
  Viva: StageResult;
}

const EMPTY_ENTRY: CareerEntry = {
  SL: "",
  Institute: "",
  Position: "",
  UserID: "",
  Password: "",
  Posts: "",
  ApplyDate: "",
  ExamStatus: "",
  Preliminary: "",
  Written: "",
  Viva: "",
};

const EXAM_STATUS_OPTIONS: ExamStatus[] = ["Done", "Future"];
const STAGE_OPTIONS: StageResult[] = ["Qualified", "Unqualified", "Not Attaint"];

const statusColors: Record<string, string> = {
  Done: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Future: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Qualified: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  Unqualified: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  "Not Attaint": "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

// ── Shared field components ─────────────────────────────────────────────────





// ── Search / select entry ───────────────────────────────────────────────────

function EntrySearchBar({
  entries,
  selected,
  onSelect,
}: {
  entries: CareerEntry[];
  selected: CareerEntry | null;
  onSelect: (entry: CareerEntry) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = entries.filter(
    (e) =>
      e.SL.toLowerCase().includes(query.toLowerCase()) ||
      e.Institute.toLowerCase().includes(query.toLowerCase()) ||
      e.Position.toLowerCase().includes(query.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (entry: CareerEntry) => {
    onSelect(entry);
    setQuery(`${entry.SL} — ${entry.Institute}`);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-1.5 block">
        Search & Select Entry <span className="text-rose-400">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search by SL, Institute, or Position…"
          className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 pl-9
            text-sm text-slate-100 placeholder:text-slate-600 outline-none
            transition-all duration-200
            focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
        {selected && (
          <button
            onClick={() => { setQuery(""); onSelect(EMPTY_ENTRY); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800">
            {filtered.map((entry) => (
              <button
                key={entry.SL}
                onClick={() => handleSelect(entry)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-800 transition-colors group ${
                  selected?.SL === entry.SL ? "bg-violet-500/10" : ""
                }`}
              >
                <span className="font-mono text-[11px] text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded px-1.5 py-0.5 shrink-0">
                  {entry.SL}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{entry.Institute}</p>
                  <p className="text-[11px] text-slate-500 truncate">{entry.Position}</p>
                </div>
                {entry.ExamStatus && (
                  <span className={`ml-auto shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[entry.ExamStatus]}`}>
                    {entry.ExamStatus}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {open && query && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50 px-4 py-3">
          <p className="text-sm text-slate-500">No entries match your search.</p>
        </div>
      )}
    </div>
  );
}

// ── Diff badge: shows what changed ─────────────────────────────────────────

function DiffIndicator({ original, current }: { original: string; current: string }) {
  if (!original || original === current) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5 ml-1">
      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      edited
    </span>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function EditCareerData() {
  const { careerData, setCareerData } = useCareerData();

  const [selectedEntry, setSelectedEntry] = useState<CareerEntry | null>(null);
  const [form, setForm] = useState<CareerEntry>(EMPTY_ENTRY);
  const [original, setOriginal] = useState<CareerEntry>(EMPTY_ENTRY);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (key: keyof CareerEntry) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleEntrySelect = (entry: CareerEntry) => {
    if (!entry.SL) {
      setSelectedEntry(null);
      setForm(EMPTY_ENTRY);
      setOriginal(EMPTY_ENTRY);
      return;
    }
    setSelectedEntry(entry);
    setForm({ ...entry });
    setOriginal({ ...entry });
    setStatus("idle");
    setMessage("");
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  const changedFields = Object.keys(form).filter(
    (k) => form[k as keyof CareerEntry] !== original[k as keyof CareerEntry]
  ) as (keyof CareerEntry)[];

  const handleUpdate = async () => {
    if (!selectedEntry) {
      setStatus("error");
      setMessage("Please select an entry to edit.");
      return;
    }
    if (!form.SL || !form.Institute || !form.Position || !form.ApplyDate) {
      setStatus("error");
      setMessage("Please fill in all required fields.");
      return;
    }
    if (!isDirty) {
      setStatus("error");
      setMessage("No changes detected.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const params = new URLSearchParams();
      // Pass original SL so the server can locate the row
      params.append("_originalSL", original.SL);
      params.append("action", "edit");
      Object.entries(form).forEach(([k, v]) => params.append(k, v));

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Optimistically update local state
      setCareerData(
        careerData.map((entry) => (entry.SL === original.SL ? { ...form } : entry))
      );
      setOriginal({ ...form });
      setSelectedEntry({ ...form });
      setStatus("success");
      setMessage(`Entry ${form.SL} updated successfully!`);
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Update failed.");
    }
  };

  const handleDiscard = () => {
    if (!selectedEntry) return;
    setForm({ ...original });
    setStatus("idle");
    setMessage("");
  };

  const isFormActive = !!selectedEntry?.SL;

  return (
    <div className="max-w-5xl m-auto py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Edit Career Entry</h1>
          <p className="text-sm text-slate-500 mt-0.5">Search, modify, and save changes to an existing entry</p>
        </div>
        <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded px-2 py-1">
          EDIT
        </span>
      </div>

      {/* Search bar */}
      <div className="mb-5 p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
        <EntrySearchBar
          entries={careerData.reverse() as CareerEntry[]}
          selected={selectedEntry}
          onSelect={handleEntrySelect}
        />

        {/* Selected summary strip */}
        {isFormActive && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Currently editing:</span>
            <span className="font-mono text-[11px] text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded px-1.5 py-0.5">
              {original.SL}
            </span>
            <span className="text-[11px] text-slate-300">{original.Institute}</span>
            <span className="text-[11px] text-slate-500">·</span>
            <span className="text-[11px] text-slate-400">{original.Position}</span>
            {isDirty && (
              <span className="ml-auto text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="4" />
                </svg>
                {changedFields.length} unsaved change{changedFields.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Form card */}
      <div className={`rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-opacity duration-300 ${!isFormActive ? "opacity-40 pointer-events-none select-none" : ""}`}>

        {!isFormActive && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            {/* overlay hint is conveyed by opacity — no extra DOM needed */}
          </div>
        )}

        {/* Section: Identity */}
        <div className="px-5 py-5 border-b border-slate-800">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-violet-400 mb-4">
            01 · Identity
            {changedFields.some((f) => ["SL", "Institute", "Position"].includes(f)) && (
              <DiffIndicator original="x" current="" />
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 flex items-center gap-1">
                SL No. <span className="text-rose-400">*</span>
                <DiffIndicator original={original.SL} current={form.SL} />
              </label>
              <input
                type="text"
                value={form.SL}
                onChange={(e) => set("SL")(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5
                  text-sm text-slate-100 placeholder:text-slate-600 outline-none font-mono tracking-wider
                  transition-all duration-200
                  focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 flex items-center gap-1">
                Institute <span className="text-rose-400">*</span>
                <DiffIndicator original={original.Institute} current={form.Institute} />
              </label>
              <input
                type="text"
                value={form.Institute}
                onChange={(e) => set("Institute")(e.target.value)}
                placeholder="e.g. BCS 47"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5
                  text-sm text-slate-100 placeholder:text-slate-600 outline-none
                  transition-all duration-200
                  focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 flex items-center gap-1">
                Position <span className="text-rose-400">*</span>
                <DiffIndicator original={original.Position} current={form.Position} />
              </label>
              <input
                type="text"
                value={form.Position}
                onChange={(e) => set("Position")(e.target.value)}
                placeholder="e.g. Sub Inspector of Food"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5
                  text-sm text-slate-100 placeholder:text-slate-600 outline-none
                  transition-all duration-200
                  focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400"
              />
            </div>
          </div>
        </div>

        {/* Section: Credentials */}
        <div className="px-5 py-5 border-b border-slate-800">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-violet-400 mb-4">
            02 · Credentials
            {changedFields.some((f) => ["UserID", "Password", "Posts", "ApplyDate"].includes(f)) && (
              <DiffIndicator original="x" current="" />
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {(
              [
                { key: "UserID", label: "User ID", placeholder: "H37FMLTG", mono: true },
                { key: "Password", label: "Password", placeholder: "U699229M", mono: true },
                { key: "Posts", label: "Posts", placeholder: "Number of posts", mono: false },
              ] as { key: keyof CareerEntry; label: string; placeholder: string; mono: boolean }[]
            ).map(({ key, label, placeholder, mono }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 flex items-center gap-1">
                  {label}
                  <DiffIndicator original={original[key]} current={form[key]} />
                </label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => set(key)(e.target.value)}
                  placeholder={placeholder}
                  className={`w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5
                    text-sm text-slate-100 placeholder:text-slate-600 outline-none
                    transition-all duration-200
                    focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400
                    ${mono ? "font-mono tracking-wider" : ""}`}
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 flex items-center gap-1">
                Apply Date <span className="text-rose-400">*</span>
                <DiffIndicator original={original.ApplyDate} current={form.ApplyDate} />
              </label>
              <input
                type="date"
                value={form.ApplyDate}
                onChange={(e) => set("ApplyDate")(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5
                  text-sm text-slate-100 placeholder:text-slate-600 outline-none
                  transition-all duration-200
                  focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400"
              />
            </div>
          </div>
        </div>

        {/* Section: Exam Status */}
        <div className="px-5 py-5">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-violet-400 mb-4">
            03 · Exam Status
            {changedFields.some((f) => ["ExamStatus", "Preliminary", "Written", "Viva"].includes(f)) && (
              <DiffIndicator original="x" current="" />
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {(
              [
                { key: "ExamStatus", label: "Exam Status", options: EXAM_STATUS_OPTIONS },
                { key: "Preliminary", label: "Preliminary", options: STAGE_OPTIONS },
                { key: "Written", label: "Written", options: STAGE_OPTIONS },
                { key: "Viva", label: "Viva", options: STAGE_OPTIONS },
              ] as { key: keyof CareerEntry; label: string; options: string[] }[]
            ).map(({ key, label, options }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 flex items-center gap-1">
                  {label}
                  <DiffIndicator original={original[key]} current={form[key]} />
                </label>
                <div className="relative">
                  <select
                    value={form[key]}
                    onChange={(e) => set(key)(e.target.value)}
                    className={`
                      w-full appearance-none rounded-lg border px-3 py-2.5 pr-8
                      text-sm font-medium bg-slate-900/80 outline-none
                      transition-all duration-200 cursor-pointer
                      focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400
                      ${form[key] ? statusColors[form[key]] + " border" : "border-slate-700 text-slate-400"}
                    `}
                  >
                    <option value="">— Select —</option>
                    {options.map((o) => (
                      <option key={o} value={o} className="bg-slate-900 text-white">
                        {o}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live badge preview */}
          {(form.ExamStatus || form.Preliminary || form.Written || form.Viva) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {form.ExamStatus && (
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[form.ExamStatus]}`}>
                  {form.ExamStatus}
                </span>
              )}
              {(["Preliminary", "Written", "Viva"] as const).map((stage) =>
                form[stage] ? (
                  <span key={stage} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[form[stage]]}`}>
                    {stage}: {form[stage]}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* Changed fields summary */}
        {isDirty && (
          <div className="px-5 py-3 bg-amber-500/5 border-t border-amber-500/20">
            <p className="text-[11px] text-amber-400/80 font-medium">
              Changed fields:{" "}
              {changedFields.map((f, i) => (
                <span key={f}>
                  <span className="font-mono text-amber-300">{f}</span>
                  {i < changedFields.length - 1 && <span className="text-amber-500/50">, </span>}
                </span>
              ))}
            </p>
          </div>
        )}

        {/* Footer: feedback + actions */}
        <div className="px-5 py-4 bg-slate-800/40 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {message && (
            <div className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border flex items-center gap-2 ${
              status === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}>
              <span>{status === "success" ? "✓" : "✕"}</span>
              {message}
            </div>
          )}
          {!message && <div className="flex-1" />}

          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleDiscard}
              disabled={status === "loading" || !isDirty}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-400 border border-slate-700
                hover:bg-slate-800 hover:text-slate-200 transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Discard
            </button>
            <button
              onClick={handleUpdate}
              disabled={status === "loading" || !isDirty || !isFormActive}
              className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-violet-600
                hover:bg-violet-500 transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Empty state hint */}
      {!isFormActive && (
        <p className="text-center text-sm text-slate-600 mt-5">
          Select an entry above to start editing
        </p>
      )}

    </div>
  );
}