import { useState, useEffect } from "react";
import { useCareerData } from "../hooks/useCareerData";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_CAREER_SHEET_READ_WRITE_API_URL;

type ExamStatus = "Done" | "Future" | "";
type StageResult = "Qualified" | "Unqualified" | "Not Attaint" | "";

interface FormData {
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

const INITIAL_FORM: FormData = {
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

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function generateSL(careerDataLength: number): string {
  const next = careerDataLength + 1;
  const padded = next < 10 ? `00${next}` : next < 100 ? `0${next}` : `${next}`;
  return `ASH-${padded}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectBadge({
  label,
  value,
  options,
  onChange,
  required,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-widest uppercase text-slate-400">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`
            w-full appearance-none rounded-lg border px-3 py-2.5 pr-8
            text-sm font-medium bg-slate-900/80 outline-none
            transition-all duration-200 cursor-pointer
            focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400
            ${value ? statusColors[value] + " border" : "border-slate-700 text-slate-400"}
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
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  mono,
  prefilled,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  mono?: boolean;
  prefilled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-400">*</span>}
        {prefilled && (
          <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded px-1.5 py-0.5">
            auto-filled
          </span>
        )}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`
          w-full rounded-lg border bg-slate-900/80 px-3 py-2.5
          text-sm text-slate-100 placeholder:text-slate-600 outline-none
          transition-all duration-200
          focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400
          ${prefilled ? "border-emerald-600/50 bg-emerald-950/20" : "border-slate-700"}
          ${mono ? "font-mono tracking-wider" : ""}
        `}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AddCareerData() {
  const { availableJobData, careerData, setCareerData } = useCareerData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    ...INITIAL_FORM,
    ApplyDate: todayISO(),
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [prefilledFields, setPrefilledFields] = useState<Set<keyof FormData>>(new Set());

  // ── Sync SL once careerData loads (only if user hasn't manually changed it) ─
  useEffect(() => {
    if (!careerData?.length) return;
    const xxxxxxxxxxxx = () => {
      setForm((prev) => {
      // Don't overwrite if user already typed something custom
      // const autoSL = generateSL(careerData.length - 1); // length-1 because current last is the latest
      const prevWasAuto =
        prev.SL === "" || prev.SL.match(/^ASH-\d+$/);
      if (!prevWasAuto) return prev;
      return { ...prev, SL: generateSL(careerData.length) };
    });
    }
    xxxxxxxxxxxx()
  }, [careerData]);

  // ── Read URL params and auto-fill form ────────────────────────────────────
  useEffect(() => {
    const institute = searchParams.get("institute");
    const post = searchParams.get("post");
    const postsCount = searchParams.get("posts");

    if (!institute && !post) return;

    const matchedJob = availableJobData.find(
      (job) =>
        job.InstitutionName?.trim().toLowerCase() === institute?.trim().toLowerCase() &&
        job.PostName?.trim().toLowerCase() === post?.trim().toLowerCase()
    );

    const filled = new Set<keyof FormData>();

    const setFormDataAuto = () => {
      setForm((prev) => {
      const next: FormData = {
        ...prev,
        ApplyDate: todayISO(),
      };
      filled.add("ApplyDate");

      if (matchedJob) {
        if (matchedJob.InstitutionName) {
          next.Institute = matchedJob.InstitutionName;
          filled.add("Institute");
        }
        if (matchedJob.PostName) {
          next.Position = matchedJob.PostName;
          filled.add("Position");
        }
        if (matchedJob.NumberOfPosts) {
          next.Posts = String(matchedJob.NumberOfPosts);
          filled.add("Posts");
        }
      } else {
        if (institute) {
          next.Institute = institute;
          filled.add("Institute");
        }
        if (post) {
          next.Position = post;
          filled.add("Position");
        }
        if (postsCount) {
          next.Posts = postsCount;
          filled.add("Posts");
        }
      }

      return next;
    });

    setPrefilledFields(filled);
    }
    setFormDataAuto ();
  }, [availableJobData, searchParams]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const set = (key: keyof FormData) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = async () => {
    // Validate against actual form state — all values must be real strings
    const missing: string[] = [];
    if (!form.SL.trim())        missing.push("SL No.");
    if (!form.Institute.trim()) missing.push("Institute");
    if (!form.Position.trim())  missing.push("Position");
    if (!form.ApplyDate.trim()) missing.push("Apply Date");

    if (missing.length > 0) {
      setStatus("error");
      setMessage(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const params = new URLSearchParams();
      Object.entries(form).forEach(([k, v]) => params.append(k, v));

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setCareerData([...careerData, { ...form }]);
      setStatus("success");
      setMessage("Entry added successfully! Redirecting…");

      // Reset after flagging success so the user sees the message briefly
      setTimeout(() => {
        setForm({
          ...INITIAL_FORM,
          ApplyDate: todayISO(),
          SL: generateSL(careerData.length + 1),
        });
        setPrefilledFields(new Set());
        navigate("/career/apply-korte-hobe");
      }, 1200);
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Submission failed.");
    }
  };

  const handleReset = () => {
    setForm({
      ...INITIAL_FORM,
      ApplyDate: todayISO(),
      SL: generateSL(careerData?.length ?? 0),
    });
    setPrefilledFields(new Set());
    setStatus("idle");
    setMessage("");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl m-auto py-10 px-2">
      <div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Add Career Entry</h1>
            <p className="text-sm text-slate-500 mt-0.5">Log a new application to your career tracker sheet</p>
          </div>
          <div className="flex items-center gap-2">
            {prefilledFields.size > 0 && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1">
                AUTO-FILLED
              </span>
            )}
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded px-2 py-1">
              WRITE
            </span>
          </div>
        </div>

        {/* Auto-fill banner */}
        {prefilledFields.size > 0 && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-600/30 bg-emerald-950/30 px-4 py-3">
            <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
            </svg>
            <p className="text-xs text-emerald-300 leading-relaxed">
              Some fields were <span className="font-semibold">auto-filled</span> from the circular you selected.
              Review them before submitting, and fill in the remaining required fields.
            </p>
          </div>
        )}

        {/* Form */}
        <div>

          {/* Section: Identity */}
          <h6 className="text-gray-200 text-xs p-4">
            Last SL: {careerData?.[careerData.length - 1]?.SL || "Unknown"}
          </h6>

          <div className="px-1 py-5 border-b border-slate-800">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-indigo-400 mb-4">
              01 · Identity
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField
                label="SL No."
                name="SL"
                value={form.SL}
                onChange={set("SL")}
                placeholder="ASH-005"
                required
                mono
              />
              <InputField
                label="Institute"
                name="Institute"
                value={form.Institute}
                onChange={set("Institute")}
                placeholder="e.g. BCS 47"
                required
                prefilled={prefilledFields.has("Institute")}
              />
              <InputField
                label="Position"
                name="Position"
                value={form.Position}
                onChange={set("Position")}
                placeholder="e.g. Sub Inspector of Food"
                required
                prefilled={prefilledFields.has("Position")}
              />
            </div>
          </div>

          {/* Section: Credentials */}
          <div className="px-1 py-5 border-b border-slate-800">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-indigo-400 mb-4">
              02 · Credentials
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <InputField
                label="User ID"
                name="UserID"
                value={form.UserID}
                onChange={set("UserID")}
                placeholder="H37FMLTG"
                mono
              />
              <InputField
                label="Password"
                name="Password"
                value={form.Password}
                onChange={set("Password")}
                placeholder="U699229M"
                mono
              />
              <InputField
                label="Posts"
                name="Posts"
                value={form.Posts}
                onChange={set("Posts")}
                placeholder="Number of posts"
                prefilled={prefilledFields.has("Posts")}
              />
              <InputField
                label="Apply Date"
                name="ApplyDate"
                value={form.ApplyDate}
                onChange={set("ApplyDate")}
                type="date"
                required
                prefilled={prefilledFields.has("ApplyDate")}
              />
            </div>
          </div>

          {/* Section: Exam Status */}
          <div className="px-1 py-5">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-indigo-400 mb-4">
              03 · Exam Status
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <SelectBadge label="Exam Status" value={form.ExamStatus} options={EXAM_STATUS_OPTIONS} onChange={set("ExamStatus")} />
              <SelectBadge label="Preliminary" value={form.Preliminary} options={STAGE_OPTIONS} onChange={set("Preliminary")} />
              <SelectBadge label="Written" value={form.Written} options={STAGE_OPTIONS} onChange={set("Written")} />
              <SelectBadge label="Viva" value={form.Viva} options={STAGE_OPTIONS} onChange={set("Viva")} />
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

          {/* Footer */}
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
                onClick={handleReset}
                disabled={status === "loading"}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-slate-200 transition-all duration-150 disabled:opacity-40"
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={status === "loading" || status === "success"}
                className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Posting…
                  </>
                ) : status === "success" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Redirecting…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Entry
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}