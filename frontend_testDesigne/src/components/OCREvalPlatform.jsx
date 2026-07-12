import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LayoutDashboard, ScanText, History as HistoryIcon, Settings as SettingsIcon,
  Upload, X, GripVertical, FileText, Image as ImageIcon, CheckCircle2, XCircle,
  AlertTriangle, PlusCircle, RotateCcw, Trash2, Download, Search, ChevronDown,
  Eye, LogOut, User, Lock, Globe, Bell, Play, Ban, Copy, ArrowRight, ArrowLeft,
  Loader2, ClipboardList, FolderOpen, ChevronUp, ChevronsUpDown, Wand2, Save,
  BarChart3, Clock, TrendingUp, Sparkles, ArrowUpDown,
} from "lucide-react";

/* ----------------------------- constants ----------------------------- */

const ENGINES = [
  { id: "vision-pro", name: "VisionOCR Pro", desc: "High-accuracy general-purpose engine" },
  { id: "swift-scan", name: "SwiftScan Lite", desc: "Fast, lightweight engine for simple documents" },
  { id: "docu-mind", name: "DocuMind Enterprise", desc: "Tuned for structured forms and tables" },
  { id: "lexo-net", name: "LexoNet Multilingual", desc: "Optimized for multilingual documents" },
];

const DOC_TYPES = [
  { id: "invoice", name: "Invoice", fields: ["Invoice Number", "Invoice Date", "Vendor Name", "Total Amount", "Tax Amount", "Due Date"] },
  { id: "receipt", name: "Receipt", fields: ["Merchant Name", "Transaction Date", "Total Amount", "Payment Method", "Receipt Number"] },
  { id: "business_card", name: "Business Card", fields: ["Full Name", "Job Title", "Company", "Phone Number", "Email Address"] },
  { id: "id_document", name: "ID Document", fields: ["Full Name", "Document Number", "Date of Birth", "Expiry Date", "Nationality"] },
  { id: "generic_form", name: "Generic Form", fields: ["Field 1", "Field 2", "Field 3", "Field 4"] },
];

const FIELD_SAMPLES = {
  "Invoice Number": ["INV-2041", "INV-8823", "INV-1190", "INV-4456"],
  "Invoice Date": ["2026-06-01", "2026-05-14", "2026-04-22", "2026-03-09"],
  "Vendor Name": ["Nova Supply Co.", "Bright Path Traders", "Meridian Goods Ltd.", "Anchor & Vale Inc."],
  "Total Amount": ["$1,240.00", "$389.50", "$2,015.75", "$674.20"],
  "Tax Amount": ["$99.20", "$31.16", "$161.26", "$53.94"],
  "Due Date": ["2026-06-15", "2026-05-28", "2026-05-06", "2026-04-01"],
  "Merchant Name": ["Corner Cafe", "Greenfield Market", "Union Hardware", "Pine & Co. Grocers"],
  "Transaction Date": ["2026-06-02 14:32", "2026-05-19 09:12", "2026-04-30 18:05", "2026-03-11 11:47"],
  "Payment Method": ["Visa **** 4471", "Mastercard **** 2290", "Cash", "Debit **** 7734"],
  "Receipt Number": ["R-55210", "R-88213", "R-10042", "R-30987"],
  "Full Name": ["Elena Marsh", "Tomas Reyes", "Priya Anand", "Sana Whitfield"],
  "Job Title": ["Product Manager", "Sales Director", "Lead Engineer", "Account Executive"],
  "Company": ["Northwind Analytics", "Cedar & Co.", "Halcyon Labs", "Fairview Systems"],
  "Phone Number": ["(555) 042-1187", "(555) 611-2093", "(555) 380-7742", "(555) 275-6608"],
  "Email Address": ["[email protected]", "[email protected]", "[email protected]", "[email protected]"],
  "Document Number": ["P4471029", "ID-990214", "D-772104", "N-118820"],
  "Date of Birth": ["1990-03-11", "1985-11-02", "1998-07-23", "1979-01-30"],
  "Expiry Date": ["2029-03-11", "2027-11-02", "2031-07-23", "2026-01-30"],
  "Nationality": ["Canadian", "Brazilian", "Indian", "Portuguese"],
  "Field 1": ["Sample entry Alpha", "Sample entry Beta"],
  "Field 2": ["Reference code 118", "Reference code 402"],
  "Field 3": ["Section note text", "Section note draft"],
  "Field 4": ["Approved", "Pending review"],
};

const EXTRA_FIELD_POOL = [
  { label: "Additional Notes", value: "Handwritten note detected in margin" },
  { label: "Stamp Text", value: "RECEIVED" },
  { label: "Barcode Value", value: "8471029384" },
];

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_SIZE = 15 * 1024 * 1024;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "workspace", label: "OCR Workspace", icon: ScanText },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

/* ------------------------------ utilities ------------------------------ */

let idCounter = 1;
const uid = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

function formatBytes(bytes) {
  if (bytes === 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function mutateValue(value) {
  if (!value) return value;
  const roll = Math.random();
  if (roll < 0.55) return value; // exact match
  if (roll < 0.8) {
    // introduce a small character-level error
    const chars = value.split("");
    const idx = Math.floor(Math.random() * chars.length);
    const swaps = { "0": "O", "O": "0", "1": "l", "l": "1", "5": "S", "S": "5", "8": "B", "e": "c", "a": "o" };
    chars[idx] = swaps[chars[idx]] || swaps[chars[idx]?.toLowerCase()] || chars[idx] + "";
    return chars.join("");
  }
  return ""; // simulate missed extraction
}

function generateMockOCR(docTypeId) {
  const docType = DOC_TYPES.find((d) => d.id === docTypeId) || DOC_TYPES[0];
  const fields = docType.fields.map((label) => {
    const base = pick(FIELD_SAMPLES[label] || ["Sample value"]);
    return { label, value: mutateValue(base) };
  }).filter((f) => f.value !== "" || Math.random() < 0.7); // some fields entirely absent from output
  if (Math.random() < 0.35) {
    fields.push({ ...pick(EXTRA_FIELD_POOL) });
  }
  const avgConfidence = Math.round(78 + Math.random() * 20);
  return { fields, confidence: avgConfidence };
}

function compareFields(ocrFields, refFields, schemaLabels) {
  const rows = [];
  schemaLabels.forEach((label) => {
    const ocr = ocrFields.find((f) => f.label === label)?.value?.trim() || "";
    const refEntry = refFields.find((f) => f.label === label);
    const ref = refEntry?.value?.trim() || "";
    let status;
    if (!ref) status = "pending";
    else if (!ocr) status = "missing";
    else if (ref.toLowerCase() === ocr.toLowerCase()) status = "match";
    else status = "mismatch";
    rows.push({ label, ocr, ref, status });
  });
  // fields OCR found that are outside the expected schema
  ocrFields.forEach((f) => {
    if (!schemaLabels.includes(f.label)) {
      rows.push({ label: f.label, ocr: f.value, ref: "", status: "additional" });
    }
  });
  // custom fields user added to reference beyond the schema
  refFields.forEach((f) => {
    if (!schemaLabels.includes(f.label) && !rows.find((r) => r.label === f.label)) {
      const ocr = ocrFields.find((o) => o.label === f.label)?.value?.trim() || "";
      const ref = f.value?.trim() || "";
      let status = !ref ? "pending" : !ocr ? "missing" : ref.toLowerCase() === ocr.toLowerCase() ? "match" : "mismatch";
      rows.push({ label: f.label, ocr, ref, status });
    }
  });
  return rows;
}

function computeAccuracy(rows) {
  const scored = rows.filter((r) => r.status !== "pending" && r.status !== "additional");
  const correct = rows.filter((r) => r.status === "match").length;
  const incorrect = rows.filter((r) => r.status === "mismatch").length;
  const missing = rows.filter((r) => r.status === "missing").length;
  const additional = rows.filter((r) => r.status === "additional").length;
  const total = scored.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;
  return { accuracy, correct, incorrect, missing, additional, total };
}

const STATUS_META = {
  match: { label: "Match", color: "var(--match)", Icon: CheckCircle2 },
  mismatch: { label: "Mismatch", color: "var(--mismatch)", Icon: XCircle },
  missing: { label: "Missing", color: "var(--missing)", Icon: AlertTriangle },
  additional: { label: "Additional", color: "var(--additional)", Icon: PlusCircle },
  pending: { label: "Pending", color: "var(--text-muted)", Icon: Clock },
};

function buildReportText(entry) {
  const rows = entry.comparison;
  const lines = [];
  lines.push(`OCR EVALUATION REPORT`);
  lines.push(`Document: ${entry.fileName}`);
  lines.push(`Document type: ${entry.docTypeName}`);
  lines.push(`Engine: ${entry.engineName}`);
  lines.push(`Date: ${formatDate(entry.date)}`);
  lines.push("");
  lines.push(`ACCURACY SUMMARY`);
  lines.push(`Overall accuracy: ${entry.accuracy}%`);
  lines.push(`Total fields: ${entry.total}  Correct: ${entry.correct}  Incorrect: ${entry.incorrect}  Missing: ${entry.missing}  Additional: ${entry.additional}`);
  lines.push("");
  lines.push(`FIELD COMPARISON`);
  rows.forEach((r) => {
    lines.push(`- [${STATUS_META[r.status].label.toUpperCase()}] ${r.label}`);
    lines.push(`    OCR output: ${r.ocr || "(none)"}`);
    lines.push(`    Reference:  ${r.ref || "(none)"}`);
  });
  return lines.join("\n");
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ------------------------------ seed data ------------------------------ */

function seedHistory() {
  const now = Date.now();
  const samples = [
    { fileName: "invoice_0412.pdf", docTypeId: "invoice", engineId: "vision-pro", daysAgo: 1 },
    { fileName: "receipt_market.jpg", docTypeId: "receipt", engineId: "swift-scan", daysAgo: 2 },
    { fileName: "biz_card_scan.png", docTypeId: "business_card", engineId: "docu-mind", daysAgo: 3 },
    { fileName: "invoice_0398.pdf", docTypeId: "invoice", engineId: "docu-mind", daysAgo: 5 },
    { fileName: "passport_id.jpg", docTypeId: "id_document", engineId: "lexo-net", daysAgo: 6 },
    { fileName: "invoice_0355.pdf", docTypeId: "invoice", engineId: "vision-pro", daysAgo: 9 },
    { fileName: "form_intake.png", docTypeId: "generic_form", engineId: "swift-scan", daysAgo: 12 },
  ];
  return samples.map((s) => {
    const docType = DOC_TYPES.find((d) => d.id === s.docTypeId);
    const engine = ENGINES.find((e) => e.id === s.engineId);
    const ocr = generateMockOCR(s.docTypeId);
    const ref = docType.fields.map((label) => ({ label, value: pick(FIELD_SAMPLES[label] || ["Value"]) }));
    const comparison = compareFields(ocr.fields, ref, docType.fields);
    const stats = computeAccuracy(comparison);
    return {
      id: uid("eval"),
      fileName: s.fileName,
      fileSize: Math.round(200000 + Math.random() * 3000000),
      docTypeId: s.docTypeId,
      docTypeName: docType.name,
      engineId: s.engineId,
      engineName: engine.name,
      date: new Date(now - s.daysAgo * 86400000).toISOString(),
      ocrFields: ocr.fields,
      refFields: ref,
      comparison,
      accuracy: stats.accuracy ?? 0,
      correct: stats.correct,
      incorrect: stats.incorrect,
      missing: stats.missing,
      additional: stats.additional,
      total: stats.total,
    };
  });
}

/* -------------------------------- shell -------------------------------- */

function Toasts({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[320px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md animate-[toastIn_.25s_ease]"
          style={{
            background: "var(--surface-2)",
            borderColor: t.type === "error" ? "rgba(248,113,113,0.4)" : "var(--border)",
            color: "var(--text)",
          }}
        >
          <div className="flex items-start gap-2">
            {t.type === "error" ? (
              <XCircle size={16} style={{ color: "var(--mismatch)" }} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={16} style={{ color: "var(--match)" }} className="mt-0.5 shrink-0" />
            )}
            <span>{t.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Sidebar({ page, setPage, profile, onLogout }) {
  return (
    <aside
      className="hidden md:flex flex-col w-[240px] shrink-0 border-r"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2.5 px-5 h-16 border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, var(--accent), #8B6FF0)" }}
        >
          <ScanText size={17} color="#0D0F14" />
        </div>
        <span className="font-display font-semibold text-[15px] tracking-tight" style={{ color: "var(--text)" }}>
          Verascan
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-200 text-left"
              style={{
                background: active ? "var(--accent-dim)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-muted)",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--surface-2)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold font-display"
            style={{ background: "var(--surface-2)", color: "var(--accent)" }}
          >
            {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium truncate" style={{ color: "var(--text)" }}>{profile.name}</div>
            <div className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{profile.role}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] w-full transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--mismatch)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <LogOut size={15} /> Log out
        </button>
      </div>
    </aside>
  );
}

function MobileNav({ page, setPage }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = page === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className="flex flex-col items-center gap-1 py-2.5 px-3 flex-1"
            style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
          >
            <Icon size={19} />
            <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ------------------------------- shared ui ------------------------------- */

function StatusChip({ status }) {
  const meta = STATUS_META[status];
  const Icon = meta.Icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium font-mono"
      style={{ background: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}
    >
      <Icon size={12} /> {meta.label}
    </span>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0"
      style={{ background: checked ? "var(--accent)" : "var(--surface-2)", border: "1px solid var(--border)" }}
    >
      <span
        className="absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl border p-5 md:p-6 ${className}`}
      style={{ background: "var(--surface)", borderColor: "var(--border)", ...style }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, className = "", type = "button", icon: Icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{
        background: "linear-gradient(135deg, var(--accent), #8B6FF0)",
        color: "#0D0F14",
        boxShadow: disabled ? "none" : "0 4px 14px rgba(91,141,239,0.25)",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(1.02)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, disabled, className = "", icon: Icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{ borderColor: "var(--border)", color: "var(--text)", background: "transparent" }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = "var(--surface-2)"; }}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

function GhostIconButton({ onClick, icon: Icon, title, danger, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ color: danger ? "var(--mismatch)" : "var(--text-muted)" }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.background = "var(--surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon size={16} />
    </button>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full px-3.5 py-2.5 pr-9 rounded-lg text-[13px] font-medium outline-none border transition-colors font-sans"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</span>
      {children}
      {hint && <span className="text-[11.5px]" style={{ color: "var(--text-muted)" }}>{hint}</span>}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`px-3.5 py-2.5 rounded-lg text-[13px] outline-none border transition-colors font-sans ${props.className || ""}`}
      style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
    />
  );
}

/* ------------------------------- Dashboard ------------------------------- */

function Dashboard({ history, workspace, setPage, onNewEvaluation }) {
  const totalEvaluations = history.length;
  const avgAccuracy = totalEvaluations
    ? Math.round(history.reduce((s, h) => s + h.accuracy, 0) / totalEvaluations)
    : 0;
  const recent = [...history].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const engineStats = ENGINES.map((e) => {
    const evals = history.filter((h) => h.engineId === e.id);
    const avg = evals.length ? Math.round(evals.reduce((s, h) => s + h.accuracy, 0) / evals.length) : null;
    return { ...e, avg, count: evals.length };
  }).sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));

  const canResume = workspace.files.length > 0 && workspace.step !== "upload";

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>Dashboard</h1>
          <p className="text-[13.5px] mt-1" style={{ color: "var(--text-muted)" }}>Overview of your OCR evaluation activity</p>
        </div>
        <div className="flex gap-2.5">
          {canResume && (
            <SecondaryButton icon={ArrowRight} onClick={() => setPage("workspace")}>Resume evaluation</SecondaryButton>
          )}
          <PrimaryButton icon={PlusCircle} onClick={onNewEvaluation}>New evaluation</PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={ClipboardList} label="Total evaluations" value={totalEvaluations} />
        <StatTile icon={TrendingUp} label="Average accuracy" value={`${avgAccuracy}%`} accent="var(--match)" />
        <StatTile icon={ScanText} label="Engines compared" value={ENGINES.length} />
        <StatTile icon={Clock} label="Last run" value={recent[0] ? formatDate(recent[0].date).split(" · ")[0] : "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-[15px] font-semibold" style={{ color: "var(--text)" }}>Recent activity</h2>
            <button onClick={() => setPage("history")} className="text-[12.5px] font-medium" style={{ color: "var(--accent)" }}>View all</button>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={FolderOpen} text="No evaluations yet. Start your first one." />
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
              {recent.map((h) => (
                <div key={h.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" style={{ borderColor: "var(--border)" }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--surface-2)" }}>
                    <FileText size={15} style={{ color: "var(--text-muted)" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate" style={{ color: "var(--text)" }}>{h.fileName}</div>
                    <div className="text-[11.5px]" style={{ color: "var(--text-muted)" }}>{h.engineName} · {formatDate(h.date)}</div>
                  </div>
                  <AccuracyPill value={h.accuracy} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} style={{ color: "var(--accent)" }} />
            <h2 className="font-display text-[15px] font-semibold" style={{ color: "var(--text)" }}>Engine leaderboard</h2>
          </div>
          <div className="flex flex-col gap-3.5">
            {engineStats.map((e, i) => (
              <div key={e.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12.5px] font-medium" style={{ color: "var(--text)" }}>{i === 0 && e.avg !== null && "🥇 "}{e.name}</span>
                  <span className="text-[12px] font-mono" style={{ color: "var(--text-muted)" }}>{e.avg !== null ? `${e.avg}%` : "no data"}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${e.avg ?? 0}%`, background: "linear-gradient(90deg, var(--accent), #8B6FF0)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-display text-[15px] font-semibold mb-4" style={{ color: "var(--text)" }}>Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction icon={Upload} title="Start new evaluation" desc="Upload documents and run OCR" onClick={onNewEvaluation} />
          <QuickAction icon={HistoryIcon} title="Review past results" desc="Search and export saved evaluations" onClick={() => setPage("history")} />
          <QuickAction icon={SettingsIcon} title="Set default engine" desc="Configure workspace preferences" onClick={() => setPage("settings")} />
        </div>
      </Card>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, accent }) {
  return (
    <Card className="!p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} style={{ color: accent || "var(--accent)" }} />
        <span className="text-[11.5px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</span>
      </div>
      <div className="font-display text-2xl font-semibold" style={{ color: "var(--text)" }}>{value}</div>
    </Card>
  );
}

function AccuracyPill({ value }) {
  const color = value >= 90 ? "var(--match)" : value >= 70 ? "var(--missing)" : "var(--mismatch)";
  return (
    <span className="font-mono text-[12.5px] font-semibold px-2.5 py-1 rounded-full" style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}>
      {value}%
    </span>
  );
}

function QuickAction({ icon: Icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2.5 p-4 rounded-xl border text-left transition-all duration-200"
      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-dim)" }}>
        <Icon size={16} style={{ color: "var(--accent)" }} />
      </div>
      <div>
        <div className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{title}</div>
        <div className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</div>
      </div>
    </button>
  );
}

function EmptyState({ icon: Icon, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
        <Icon size={19} style={{ color: "var(--text-muted)" }} />
      </div>
      <p className="text-[13px] max-w-[260px]" style={{ color: "var(--text-muted)" }}>{text}</p>
      {action}
    </div>
  );
}

/* ------------------------------- Workspace ------------------------------- */

const STEPS = [
  { id: "upload", label: "Upload & configure" },
  { id: "process", label: "Process" },
  { id: "review", label: "Review & compare" },
];

function Stepper({ step, files }) {
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-semibold shrink-0"
              style={{
                background: i <= stepIndex ? "var(--accent)" : "var(--surface-2)",
                color: i <= stepIndex ? "#0D0F14" : "var(--text-muted)",
              }}
            >
              {i < stepIndex ? <CheckCircle2 size={13} /> : i + 1}
            </div>
            <span className="text-[12.5px] font-medium hidden sm:inline" style={{ color: i <= stepIndex ? "var(--text)" : "var(--text-muted)" }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && <div className="flex-1 h-px" style={{ background: i < stepIndex ? "var(--accent)" : "var(--border)" }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function UploadPanel({ workspace, setWorkspace, addToast }) {
  const [dragOver, setDragOver] = useState(false);
  const dragIndexRef = useRef(null);
  const inputRef = useRef(null);

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList);
    setWorkspace((prev) => {
      let files = [...prev.files];
      incoming.forEach((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          addToast(`Unsupported file type: ${file.name}`, "error");
          return;
        }
        if (file.size > MAX_SIZE) {
          addToast(`${file.name} exceeds the 15 MB limit`, "error");
          return;
        }
        const dup = files.find((f) => f.name === file.name && f.size === file.size);
        if (dup) {
          addToast(`Duplicate file skipped: ${file.name}`, "error");
          return;
        }
        const previewUrl = URL.createObjectURL(file);
        files.push({
          id: uid("file"), file, name: file.name, size: file.size, type: file.type,
          previewUrl, status: "pending", progress: 0, ocrFields: null, errorMsg: null,
        });
      });
      return { ...prev, files };
    });
  }, [setWorkspace, addToast]);

  const removeFile = (id) => {
    setWorkspace((prev) => {
      const target = prev.files.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return { ...prev, files: prev.files.filter((f) => f.id !== id) };
    });
  };

  const clearAll = () => {
    workspace.files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setWorkspace((prev) => ({ ...prev, files: [] }));
  };

  const moveFile = (index, dir) => {
    setWorkspace((prev) => {
      const files = [...prev.files];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= files.length) return prev;
      [files[index], files[newIndex]] = [files[newIndex], files[index]];
      return { ...prev, files };
    });
  };

  const onDrop = (index) => {
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    setWorkspace((prev) => {
      const files = [...prev.files];
      const [moved] = files.splice(from, 1);
      files.splice(index, 0, moved);
      return { ...prev, files };
    });
    dragIndexRef.current = null;
  };

  const canStart = workspace.files.length > 0 && workspace.docType && workspace.engine;

  const startProcessing = () => {
    setWorkspace((prev) => ({
      ...prev,
      step: "process",
      isRunning: true,
      files: prev.files.map((f) => ({ ...f, status: "queued", progress: 0, ocrFields: null, errorMsg: null })),
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Document type" hint="Determines which fields the engine will look for">
            <Select
              value={workspace.docType}
              onChange={(v) => setWorkspace((p) => ({ ...p, docType: v }))}
              options={DOC_TYPES.map((d) => ({ value: d.id, label: d.name }))}
            />
          </Field>
          <Field label="OCR engine" hint="Applied to every file in this batch">
            <Select
              value={workspace.engine}
              onChange={(v) => setWorkspace((p) => ({ ...p, engine: v }))}
              options={ENGINES.map((e) => ({ value: e.id, label: e.name }))}
            />
          </Field>
        </div>
        {workspace.engine && (
          <p className="text-[12px] mt-3" style={{ color: "var(--text-muted)" }}>
            {ENGINES.find((e) => e.id === workspace.engine)?.desc}
          </p>
        )}
      </Card>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-14 px-6 text-center transition-colors duration-200 cursor-pointer"
        style={{ borderColor: dragOver ? "var(--accent)" : "var(--border)", background: dragOver ? "var(--accent-dim)" : "var(--surface)" }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef} type="file" multiple hidden
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--accent-dim)" }}>
          <Upload size={20} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <p className="text-[14px] font-medium" style={{ color: "var(--text)" }}>Drop files here or click to browse</p>
          <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>PNG, JPEG, WebP or PDF · up to 15 MB per file</p>
        </div>
      </div>

      {workspace.files.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-[14px] font-semibold" style={{ color: "var(--text)" }}>
              Files ({workspace.files.length})
            </h3>
            <button onClick={clearAll} className="text-[12.5px] font-medium flex items-center gap-1.5" style={{ color: "var(--mismatch)" }}>
              <Trash2 size={13} /> Clear all
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {workspace.files.map((f, i) => (
              <div
                key={f.id}
                draggable
                onDragStart={() => (dragIndexRef.current = i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
              >
                <GripVertical size={15} style={{ color: "var(--text-muted)" }} className="cursor-grab shrink-0" />
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--surface)" }}>
                  {f.type === "application/pdf" ? <FileText size={15} style={{ color: "var(--text-muted)" }} /> : <ImageIcon size={15} style={{ color: "var(--text-muted)" }} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium truncate" style={{ color: "var(--text)" }}>{f.name}</div>
                  <div className="text-[11.5px]" style={{ color: "var(--text-muted)" }}>{formatBytes(f.size)}</div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <GhostIconButton icon={ChevronUp} title="Move up" onClick={() => moveFile(i, -1)} disabled={i === 0} />
                  <GhostIconButton icon={ChevronDown} title="Move down" onClick={() => moveFile(i, 1)} disabled={i === workspace.files.length - 1} />
                  <GhostIconButton icon={X} title="Remove file" danger onClick={() => removeFile(f.id)} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <PrimaryButton icon={Play} disabled={!canStart} onClick={startProcessing}>
          Start processing {workspace.files.length > 0 && `(${workspace.files.length})`}
        </PrimaryButton>
      </div>
    </div>
  );
}

function ProcessPanel({ workspace, setWorkspace }) {
  useEffect(() => {
    if (!workspace.isRunning) return;
    const interval = setInterval(() => {
      setWorkspace((prev) => {
        const files = prev.files.map((f) => {
          if (f.status === "queued") return { ...f, status: "processing", progress: 3 };
          if (f.status === "processing") {
            const next = Math.min(100, f.progress + 8 + Math.random() * 22);
            if (next >= 100) {
              const failed = Math.random() < 0.12;
              if (failed) return { ...f, progress: 100, status: "error", errorMsg: "Engine timeout — unable to parse document" };
              return { ...f, progress: 100, status: "done", ocrFields: generateMockOCR(prev.docType).fields };
            }
            return { ...f, progress: next };
          }
          return f;
        });
        const stillGoing = files.some((f) => f.status === "processing" || f.status === "queued");
        return { ...prev, files, isRunning: stillGoing };
      });
    }, 450);
    return () => clearInterval(interval);
  }, [workspace.isRunning, setWorkspace]);

  const cancelAll = () => {
    setWorkspace((prev) => ({
      ...prev,
      isRunning: false,
      files: prev.files.map((f) => (f.status === "processing" || f.status === "queued") ? { ...f, status: "canceled" } : f),
    }));
  };

  const retryFile = (id) => {
    setWorkspace((prev) => ({
      ...prev,
      isRunning: true,
      files: prev.files.map((f) => (f.id === id ? { ...f, status: "queued", progress: 0, errorMsg: null } : f)),
    }));
  };

  const allSettled = workspace.files.every((f) => ["done", "error", "canceled"].includes(f.status));
  const doneCount = workspace.files.filter((f) => f.status === "done").length;

  const proceedToReview = () => {
    const docType = DOC_TYPES.find((d) => d.id === workspace.docType);
    setWorkspace((prev) => ({
      ...prev,
      step: "review",
      activeFileId: prev.files.find((f) => f.status === "done")?.id || null,
      referenceData: {
        ...prev.referenceData,
        ...Object.fromEntries(
          prev.files.filter((f) => f.status === "done" && !prev.referenceData[f.id]).map((f) => [f.id, docType.fields.map((label) => ({ label, value: "" }))])
        ),
      },
    }));
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-[14px] font-semibold" style={{ color: "var(--text)" }}>Processing with {ENGINES.find((e) => e.id === workspace.engine)?.name}</h3>
          {workspace.isRunning ? (
            <SecondaryButton icon={Ban} onClick={cancelAll}>Cancel all</SecondaryButton>
          ) : (
            <span className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>{doneCount}/{workspace.files.length} completed</span>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-2.5">
        {workspace.files.map((f) => (
          <Card key={f.id} className="!py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--surface-2)" }}>
                {f.type === "application/pdf" ? <FileText size={15} style={{ color: "var(--text-muted)" }} /> : <ImageIcon size={15} style={{ color: "var(--text-muted)" }} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium truncate mb-1.5" style={{ color: "var(--text)" }}>{f.name}</div>
                {(f.status === "processing" || f.status === "queued") && (
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${f.progress}%`, background: "linear-gradient(90deg, var(--accent), #8B6FF0)" }} />
                  </div>
                )}
                {f.status === "error" && <div className="text-[11.5px]" style={{ color: "var(--mismatch)" }}>{f.errorMsg}</div>}
                {f.status === "canceled" && <div className="text-[11.5px]" style={{ color: "var(--text-muted)" }}>Canceled</div>}
                {f.status === "done" && <div className="text-[11.5px]" style={{ color: "var(--match)" }}>Extraction complete</div>}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {f.status === "processing" || f.status === "queued" ? (
                  <span className="text-[12px] font-mono flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                    <Loader2 size={13} className="animate-spin" /> {Math.round(f.progress)}%
                  </span>
                ) : f.status === "done" ? (
                  <CheckCircle2 size={18} style={{ color: "var(--match)" }} />
                ) : f.status === "error" ? (
                  <SecondaryButton icon={RotateCcw} onClick={() => retryFile(f.id)}>Retry</SecondaryButton>
                ) : (
                  <SecondaryButton icon={RotateCcw} onClick={() => retryFile(f.id)}>Retry</SecondaryButton>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {allSettled && (
        <div className="flex justify-end">
          <PrimaryButton icon={ArrowRight} disabled={doneCount === 0} onClick={proceedToReview}>Continue to review</PrimaryButton>
        </div>
      )}
    </div>
  );
}

function ReviewPanel({ workspace, setWorkspace, addToast, onSaveEvaluation, savedFileIds, settings }) {
  const doneFiles = workspace.files.filter((f) => f.status === "done");
  const activeFile = doneFiles.find((f) => f.id === workspace.activeFileId) || doneFiles[0];
  const docType = DOC_TYPES.find((d) => d.id === workspace.docType);
  const refFields = workspace.referenceData[activeFile?.id] || [];

  const setActiveFile = (id) => setWorkspace((p) => ({ ...p, activeFileId: id }));

  const updateRefField = (label, value) => {
    setWorkspace((prev) => ({
      ...prev,
      referenceData: {
        ...prev.referenceData,
        [activeFile.id]: prev.referenceData[activeFile.id].map((f) => (f.label === label ? { ...f, value } : f)),
      },
    }));
  };

  const addCustomField = () => {
    const label = `Custom Field ${refFields.filter((f) => !docType.fields.includes(f.label)).length + 1}`;
    setWorkspace((prev) => ({
      ...prev,
      referenceData: { ...prev.referenceData, [activeFile.id]: [...prev.referenceData[activeFile.id], { label, value: "" }] },
    }));
  };

  const copyFromOCR = (label) => {
    const ocrVal = activeFile.ocrFields.find((f) => f.label === label)?.value || "";
    updateRefField(label, ocrVal);
  };

  const autofillAll = () => {
    setWorkspace((prev) => ({
      ...prev,
      referenceData: {
        ...prev.referenceData,
        [activeFile.id]: prev.referenceData[activeFile.id].map((f) => ({
          ...f, value: activeFile.ocrFields.find((o) => o.label === f.label)?.value || f.value,
        })),
      },
    }));
    addToast("Reference fields autofilled from OCR output — verify before saving", "success");
  };

  if (!activeFile) {
    return <EmptyState icon={AlertTriangle} text="No successfully processed documents to review. Go back and retry failed files." />;
  }

  const comparison = compareFields(activeFile.ocrFields, refFields, docType.fields);
  const stats = computeAccuracy(comparison);
  const isSaved = savedFileIds.includes(activeFile.id);

  const buildEntry = () => ({
    id: uid("eval"),
    fileName: activeFile.name,
    fileSize: activeFile.size,
    docTypeId: docType.id,
    docTypeName: docType.name,
    engineId: workspace.engine,
    engineName: ENGINES.find((e) => e.id === workspace.engine)?.name,
    date: new Date().toISOString(),
    ocrFields: activeFile.ocrFields,
    refFields,
    comparison,
    accuracy: stats.accuracy ?? 0,
    correct: stats.correct, incorrect: stats.incorrect, missing: stats.missing, additional: stats.additional, total: stats.total,
    sourceFileId: activeFile.id,
  });

  const handleSave = () => {
    if (stats.total === 0) { addToast("Enter at least one reference value before saving", "error"); return; }
    onSaveEvaluation(buildEntry());
  };

  const handleExport = (format) => {
    const entry = buildEntry();
    const content = buildReportText(entry);
    downloadTextFile(`${activeFile.name.replace(/\.[^.]+$/, "")}_evaluation.${format}`, content);
    addToast(`Exported as .${format}`, "success");
  };

  return (
    <div className="flex flex-col gap-5">
      {doneFiles.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {doneFiles.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFile(f.id)}
              className="px-3.5 py-2 rounded-lg text-[12.5px] font-medium whitespace-nowrap border transition-colors shrink-0"
              style={{
                background: activeFile.id === f.id ? "var(--accent-dim)" : "transparent",
                color: activeFile.id === f.id ? "var(--accent)" : "var(--text-muted)",
                borderColor: activeFile.id === f.id ? "var(--accent)" : "var(--border)",
              }}
            >
              {f.name} {savedFileIds.includes(f.id) && "✓"}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="flex flex-col gap-4">
          <h3 className="font-display text-[14px] font-semibold" style={{ color: "var(--text)" }}>Document preview</h3>
          <div className="rounded-xl overflow-hidden border h-[280px] flex items-center justify-center" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            {activeFile.type === "application/pdf" ? (
              <iframe title="preview" src={activeFile.previewUrl} className="w-full h-full" />
            ) : (
              <img src={activeFile.previewUrl} alt={activeFile.name} className="max-w-full max-h-full object-contain" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-[12.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Raw OCR output</h4>
            <button onClick={autofillAll} className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
              <Wand2 size={13} /> Autofill reference
            </button>
          </div>
          <div className="flex flex-col gap-2 font-mono text-[12.5px]">
            {activeFile.ocrFields.length === 0 && <span style={{ color: "var(--text-muted)" }}>No fields detected</span>}
            {activeFile.ocrFields.map((f) => (
              <div key={f.label} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg" style={{ background: "var(--surface-2)" }}>
                <div className="min-w-0">
                  <div className="text-[10.5px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{f.label}</div>
                  <div className="truncate" style={{ color: "var(--text)" }}>{f.value || "—"}</div>
                </div>
                <button onClick={() => copyFromOCR(f.label)} title="Use as reference" className="shrink-0 opacity-70 hover:opacity-100">
                  <Copy size={13} style={{ color: "var(--accent)" }} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-[14px] font-semibold" style={{ color: "var(--text)" }}>Reference data</h3>
              <button onClick={addCustomField} className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
                <PlusCircle size={13} /> Add field
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {refFields.map((f) => (
                <Field key={f.label} label={f.label}>
                  <TextInput value={f.value} onChange={(e) => updateRefField(f.label, e.target.value)} placeholder="Enter correct value" />
                </Field>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-[14px] font-semibold mb-4" style={{ color: "var(--text)" }}>Accuracy</h3>
            {stats.total === 0 ? (
              <p className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>Enter reference values to calculate accuracy.</p>
            ) : (
              <>
                <div className="flex items-end gap-2 mb-4">
                  <span className="font-display text-4xl font-bold" style={{ color: "var(--text)" }}>{stats.accuracy}%</span>
                  <span className="text-[12.5px] mb-1.5" style={{ color: "var(--text-muted)" }}>overall field accuracy</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <MiniStat label="Correct" value={stats.correct} color="var(--match)" />
                  <MiniStat label="Incorrect" value={stats.incorrect} color="var(--mismatch)" />
                  <MiniStat label="Missing" value={stats.missing} color="var(--missing)" />
                  <MiniStat label="Additional" value={stats.additional} color="var(--additional)" />
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      <Card>
        <h3 className="font-display text-[14px] font-semibold mb-4" style={{ color: "var(--text)" }}>Field comparison</h3>
        <div className="flex flex-col gap-2">
          {comparison.map((row) => {
            const meta = STATUS_META[row.status];
            return (
              <div
                key={row.label}
                className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_1.4fr_auto] gap-3 items-center px-4 py-3 rounded-lg border-l-[3px]"
                style={{ background: "var(--surface-2)", borderLeftColor: meta.color }}
              >
                <span className="text-[12.5px] font-medium" style={{ color: "var(--text)" }}>{row.label}</span>
                <span className="text-[12.5px] font-mono truncate" style={{ color: "var(--text-muted)" }}>{row.ocr || "—"}</span>
                <span className="text-[12.5px] font-mono truncate" style={{ color: "var(--text-muted)" }}>{row.ref || "—"}</span>
                <StatusChip status={row.status} />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isSaved && <span className="text-[12.5px] flex items-center gap-1.5" style={{ color: "var(--match)" }}><CheckCircle2 size={14} /> Saved to history</span>}
        </div>
        <div className="flex gap-2.5">
          <ExportMenu onExport={handleExport} defaultFormat={settings.exportPrefs.defaultFormat} />
          <PrimaryButton icon={Save} onClick={handleSave}>Save evaluation</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="rounded-lg px-2 py-2.5 text-center" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
      <div className="font-mono text-[16px] font-semibold" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function ExportMenu({ onExport, defaultFormat }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <SecondaryButton icon={Download} onClick={() => setOpen((o) => !o)}>Export</SecondaryButton>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-40 rounded-xl border shadow-xl overflow-hidden z-20" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          {["pdf", "docx", "txt"].map((fmt) => (
            <button
              key={fmt}
              onClick={() => { onExport(fmt); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors flex items-center justify-between"
              style={{ color: "var(--text)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              .{fmt} {fmt === defaultFormat && <span className="text-[10px]" style={{ color: "var(--accent)" }}>default</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Workspace({ workspace, setWorkspace, addToast, onSaveEvaluation, savedFileIds, settings }) {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight mb-1" style={{ color: "var(--text)" }}>OCR Workspace</h1>
      <p className="text-[13.5px] mb-6" style={{ color: "var(--text-muted)" }}>Upload, process, and evaluate documents against manually entered reference data</p>
      <Stepper step={workspace.step} />
      {workspace.step === "upload" && <UploadPanel workspace={workspace} setWorkspace={setWorkspace} addToast={addToast} />}
      {workspace.step === "process" && <ProcessPanel workspace={workspace} setWorkspace={setWorkspace} />}
      {workspace.step === "review" && (
        <ReviewPanel workspace={workspace} setWorkspace={setWorkspace} addToast={addToast} onSaveEvaluation={onSaveEvaluation} savedFileIds={savedFileIds} settings={settings} />
      )}
    </div>
  );
}

/* -------------------------------- History -------------------------------- */

function HistoryPage({ history, setHistory, addToast }) {
  const [search, setSearch] = useState("");
  const [engineFilter, setEngineFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let rows = history.filter((h) => h.fileName.toLowerCase().includes(search.toLowerCase()));
    if (engineFilter !== "all") rows = rows.filter((h) => h.engineId === engineFilter);
    rows = [...rows].sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date_asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "accuracy_desc") return b.accuracy - a.accuracy;
      if (sortBy === "accuracy_asc") return a.accuracy - b.accuracy;
      return 0;
    });
    return rows;
  }, [history, search, engineFilter, sortBy]);

  const deleteEntry = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (selected?.id === id) setSelected(null);
    addToast("Evaluation deleted", "success");
  };

  const exportEntry = (entry, format) => {
    downloadTextFile(`${entry.fileName.replace(/\.[^.]+$/, "")}_evaluation.${format}`, buildReportText(entry));
    addToast(`Exported as .${format}`, "success");
  };

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight mb-1" style={{ color: "var(--text)" }}>History</h1>
      <p className="text-[13.5px] mb-6" style={{ color: "var(--text-muted)" }}>Search, review, and export saved evaluations</p>

      <Card className="!p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by file name" className="pl-9 w-full" />
          </div>
          <div className="w-full sm:w-52">
            <Select
              value={engineFilter}
              onChange={setEngineFilter}
              options={[{ value: "all", label: "All engines" }, ...ENGINES.map((e) => ({ value: e.id, label: e.name }))]}
            />
          </div>
          <div className="w-full sm:w-52">
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "date_desc", label: "Newest first" },
                { value: "date_asc", label: "Oldest first" },
                { value: "accuracy_desc", label: "Accuracy: high to low" },
                { value: "accuracy_asc", label: "Accuracy: low to high" },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6"><EmptyState icon={FolderOpen} text="No evaluations match your filters." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  {["Document", "Type", "Engine", "Date", "Accuracy", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id} className="border-b last:border-0 transition-colors" style={{ borderColor: "var(--border)" }}>
                    <td className="px-5 py-3.5 text-[13px] font-medium" style={{ color: "var(--text)" }}>{h.fileName}</td>
                    <td className="px-5 py-3.5 text-[12.5px]" style={{ color: "var(--text-muted)" }}>{h.docTypeName}</td>
                    <td className="px-5 py-3.5 text-[12.5px]" style={{ color: "var(--text-muted)" }}>{h.engineName}</td>
                    <td className="px-5 py-3.5 text-[12.5px] font-mono" style={{ color: "var(--text-muted)" }}>{formatDate(h.date)}</td>
                    <td className="px-5 py-3.5"><AccuracyPill value={h.accuracy} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <GhostIconButton icon={Eye} title="Review" onClick={() => setSelected(h)} />
                        <GhostIconButton icon={Download} title="Export" onClick={() => exportEntry(h, "pdf")} />
                        <GhostIconButton icon={Trash2} title="Delete" danger onClick={() => { if (window.confirm(`Delete evaluation for ${h.fileName}?`)) deleteEntry(h.id); }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && <HistoryDrawer entry={selected} onClose={() => setSelected(null)} onExport={exportEntry} onDelete={deleteEntry} />}
    </div>
  );
}

function HistoryDrawer({ entry, onClose, onExport, onDelete }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div className="relative w-full max-w-lg h-full overflow-y-auto p-6 flex flex-col gap-5" style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)" }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text)" }}>{entry.fileName}</h2>
            <p className="text-[12.5px] mt-1" style={{ color: "var(--text-muted)" }}>{entry.engineName} · {formatDate(entry.date)}</p>
          </div>
          <GhostIconButton icon={X} title="Close" onClick={onClose} />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="font-display text-3xl font-bold" style={{ color: "var(--text)" }}>{entry.accuracy}%</span>
          <span className="text-[12.5px] mb-1" style={{ color: "var(--text-muted)" }}>overall accuracy</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <MiniStat label="Correct" value={entry.correct} color="var(--match)" />
          <MiniStat label="Incorrect" value={entry.incorrect} color="var(--mismatch)" />
          <MiniStat label="Missing" value={entry.missing} color="var(--missing)" />
          <MiniStat label="Additional" value={entry.additional} color="var(--additional)" />
        </div>

        <div>
          <h3 className="text-[12.5px] font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>Field comparison</h3>
          <div className="flex flex-col gap-2">
            {entry.comparison.map((row) => {
              const meta = STATUS_META[row.status];
              return (
                <div key={row.label} className="flex flex-col gap-1 px-3.5 py-2.5 rounded-lg border-l-[3px]" style={{ background: "var(--surface-2)", borderLeftColor: meta.color }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-medium" style={{ color: "var(--text)" }}>{row.label}</span>
                    <StatusChip status={row.status} />
                  </div>
                  <div className="text-[11.5px] font-mono" style={{ color: "var(--text-muted)" }}>OCR: {row.ocr || "—"} · Ref: {row.ref || "—"}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2.5 mt-auto pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          {["pdf", "docx", "txt"].map((fmt) => (
            <SecondaryButton key={fmt} onClick={() => onExport(entry, fmt)}>.{fmt}</SecondaryButton>
          ))}
          <button
            onClick={() => { if (window.confirm(`Delete evaluation for ${entry.fileName}?`)) { onDelete(entry.id); onClose(); } }}
            className="ml-auto text-[12.5px] font-medium flex items-center gap-1.5"
            style={{ color: "var(--mismatch)" }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Settings -------------------------------- */

function SettingsPage({ profile, setProfile, settings, setSettings, addToast, onLogout }) {
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [localProfile, setLocalProfile] = useState(profile);

  const saveProfile = () => { setProfile(localProfile); addToast("Profile updated", "success"); };

  const savePassword = () => {
    if (!password.current || !password.next) { addToast("Enter your current and new password", "error"); return; }
    if (password.next.length < 8) { addToast("New password must be at least 8 characters", "error"); return; }
    if (password.next !== password.confirm) { addToast("New password and confirmation do not match", "error"); return; }
    setPassword({ current: "", next: "", confirm: "" });
    addToast("Password changed", "success");
  };

  const savePrefs = () => addToast("Preferences saved", "success");

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>Settings</h1>
        <p className="text-[13.5px] mt-1" style={{ color: "var(--text-muted)" }}>Manage your profile, security, and workspace preferences</p>
      </div>

      <Card>
        <h2 className="font-display text-[15px] font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}><User size={16} /> Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Full name">
            <TextInput value={localProfile.name} onChange={(e) => setLocalProfile((p) => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field label="Email address">
            <TextInput type="email" value={localProfile.email} onChange={(e) => setLocalProfile((p) => ({ ...p, email: e.target.value }))} />
          </Field>
        </div>
        <div className="flex justify-end"><SecondaryButton icon={Save} onClick={saveProfile}>Save profile</SecondaryButton></div>
      </Card>

      <Card>
        <h2 className="font-display text-[15px] font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}><Lock size={16} /> Security</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Field label="Current password"><TextInput type="password" value={password.current} onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))} /></Field>
          <Field label="New password"><TextInput type="password" value={password.next} onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))} /></Field>
          <Field label="Confirm new password"><TextInput type="password" value={password.confirm} onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))} /></Field>
        </div>
        <div className="flex justify-end"><SecondaryButton icon={Save} onClick={savePassword}>Change password</SecondaryButton></div>
      </Card>

      <Card>
        <h2 className="font-display text-[15px] font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}><ScanText size={16} /> Workspace preferences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Default OCR engine">
            <Select value={settings.defaultEngine} onChange={(v) => setSettings((s) => ({ ...s, defaultEngine: v }))} options={ENGINES.map((e) => ({ value: e.id, label: e.name }))} />
          </Field>
          <Field label="Language">
            <Select
              value={settings.language}
              onChange={(v) => setSettings((s) => ({ ...s, language: v }))}
              options={[{ value: "en", label: "English" }, { value: "es", label: "Spanish" }, { value: "fr", label: "French" }, { value: "de", label: "German" }, { value: "pt", label: "Portuguese" }]}
            />
          </Field>
        </div>
        <div className="flex justify-end"><SecondaryButton icon={Save} onClick={savePrefs}>Save preferences</SecondaryButton></div>
      </Card>

      <Card>
        <h2 className="font-display text-[15px] font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}><Bell size={16} /> Notifications</h2>
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
          <NotificationRow label="Email alerts" desc="Receive an email for account and security events" checked={settings.notifications.emailAlerts} onChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, emailAlerts: v } }))} />
          <NotificationRow label="Evaluation complete" desc="Notify when OCR processing finishes" checked={settings.notifications.completionAlerts} onChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, completionAlerts: v } }))} />
          <NotificationRow label="Weekly summary" desc="A weekly digest of evaluation activity" checked={settings.notifications.weeklySummary} onChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, weeklySummary: v } }))} />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-[15px] font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}><Download size={16} /> Export preferences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Default export format">
            <Select value={settings.exportPrefs.defaultFormat} onChange={(v) => setSettings((s) => ({ ...s, exportPrefs: { ...s.exportPrefs, defaultFormat: v } }))} options={[{ value: "pdf", label: "PDF" }, { value: "docx", label: "DOCX" }, { value: "txt", label: "TXT" }]} />
          </Field>
          <div className="flex items-end pb-2.5">
            <div className="flex items-center gap-3">
              <Toggle checked={settings.exportPrefs.includeOriginal} onChange={(v) => setSettings((s) => ({ ...s, exportPrefs: { ...s.exportPrefs, includeOriginal: v } }))} label="Include original document reference" />
              <span className="text-[12.5px]" style={{ color: "var(--text)" }}>Include original document reference in exports</span>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ borderColor: "rgba(248,113,113,0.3)" }}>
        <h2 className="font-display text-[15px] font-semibold mb-1" style={{ color: "var(--text)" }}>Session</h2>
        <p className="text-[12.5px] mb-4" style={{ color: "var(--text-muted)" }}>Sign out of Verascan on this device.</p>
        <SecondaryButton icon={LogOut} onClick={onLogout}>Log out</SecondaryButton>
      </Card>
    </div>
  );
}

function NotificationRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
      <div>
        <div className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{label}</div>
        <div className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

/* --------------------------------- login --------------------------------- */

function LoginGate({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
      <Card className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, var(--accent), #8B6FF0)" }}>
          <ScanText size={22} color="#0D0F14" />
        </div>
        <h1 className="font-display text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>You've been signed out</h1>
        <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>Sign back in to continue evaluating OCR engines.</p>
        <PrimaryButton className="w-full" onClick={onLogin}>Log back in</PrimaryButton>
      </Card>
    </div>
  );
}

/* ---------------------------------- app ---------------------------------- */

function initialWorkspaceState(engine) {
  return { step: "upload", docType: "invoice", engine: engine || "vision-pro", files: [], activeFileId: null, isRunning: false, referenceData: {} };
}

export default function TestApp() {
  const [authenticated, setAuthenticated] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [toasts, setToasts] = useState([]);
  const [history, setHistory] = useState(() => seedHistory());
  const [savedFileIds, setSavedFileIds] = useState([]);
  const [profile, setProfile] = useState({ name: "Jordan Ellis", email: "[email protected]", role: "QA Analyst" });
  const [settings, setSettings] = useState({
    defaultEngine: "vision-pro",
    language: "en",
    notifications: { emailAlerts: true, completionAlerts: true, weeklySummary: false },
    exportPrefs: { defaultFormat: "pdf", includeOriginal: true },
  });
  const [workspace, setWorkspace] = useState(() => initialWorkspaceState(settings.defaultEngine));

  const addToast = useCallback((message, type = "success") => {
    const id = uid("toast");
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const handleNewEvaluation = () => {
    setWorkspace(initialWorkspaceState(settings.defaultEngine));
    setPage("workspace");
  };

  const handleSaveEvaluation = (entry) => {
    setHistory((prev) => [entry, ...prev]);
    if (entry.sourceFileId) setSavedFileIds((prev) => [...prev, entry.sourceFileId]);
    addToast("Evaluation saved to history", "success");
  };

  const handleLogout = () => {
    setAuthenticated(false);
    addToast("Logged out", "success");
  };

  if (!authenticated) {
    return (
      <div className="ocr-app">
        <GlobalStyles />
        <LoginGate onLogin={() => setAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="ocr-app min-h-screen flex" style={{ background: "var(--bg)" }}>
      <GlobalStyles />
      <Sidebar page={page} setPage={setPage} profile={profile} onLogout={handleLogout} />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {page === "dashboard" && <Dashboard history={history} workspace={workspace} setPage={setPage} onNewEvaluation={handleNewEvaluation} />}
        {page === "workspace" && (
          <Workspace workspace={workspace} setWorkspace={setWorkspace} addToast={addToast} onSaveEvaluation={handleSaveEvaluation} savedFileIds={savedFileIds} settings={settings} />
        )}
        {page === "history" && <HistoryPage history={history} setHistory={setHistory} addToast={addToast} />}
        {page === "settings" && <SettingsPage profile={profile} setProfile={setProfile} settings={settings} setSettings={setSettings} addToast={addToast} onLogout={handleLogout} />}
      </main>
      <MobileNav page={page} setPage={setPage} />
      <Toasts toasts={toasts} />
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
      .ocr-app {
        --bg: #0D0F14;
        --surface: #151821;
        --surface-2: #1C202B;
        --border: rgba(255,255,255,0.08);
        --text: #E8EAF0;
        --text-muted: #8B92A3;
        --accent: #5B8DEF;
        --accent-dim: rgba(91,141,239,0.14);
        --match: #34D399;
        --mismatch: #F87171;
        --missing: #FBBF24;
        --additional: #60A5FA;
        font-family: 'Inter', sans-serif;
      }
      .ocr-app .font-display { font-family: 'Space Grotesk', sans-serif; }
      .ocr-app .font-mono { font-family: 'JetBrains Mono', monospace; }
      .ocr-app select option { background: #1C202B; color: #E8EAF0; }
      .ocr-app ::-webkit-scrollbar { width: 8px; height: 8px; }
      .ocr-app ::-webkit-scrollbar-track { background: transparent; }
      .ocr-app ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 8px; }
      .ocr-app input:focus, .ocr-app select:focus, .ocr-app button:focus-visible {
        outline: 2px solid var(--accent); outline-offset: 1px;
      }
      @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @media (prefers-reduced-motion: reduce) {
        .ocr-app * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
      }
    `}</style>
  );
}
