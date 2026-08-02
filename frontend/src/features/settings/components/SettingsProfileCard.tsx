import { UserRound } from "lucide-react";

interface SettingsProfileCardProps {
  fullName: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function SettingsProfileCard({
  fullName,
  email,
  onNameChange,
  onEmailChange,
  onSave,
  isSaving,
}: SettingsProfileCardProps) {
  return (
    <section className="rounded-2xl border border-[#222334] bg-[#10111a] p-5">
      <div className="mb-4 flex items-center gap-3 text-white">
        <div className="rounded-lg bg-[#1a1a28] p-2 text-[#9ca3af]">
          <UserRound className="h-4 w-4" />
        </div>
        <div className="text-lg font-semibold">Profile</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8494]">Full name</div>
          <input
            value={fullName}
            onChange={(event) => onNameChange(event.target.value)}
            className="w-full rounded-xl border border-[#2a2a39] bg-[#171722] px-3 py-3 text-sm text-white outline-none"
          />
        </label>

        <label className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8494]">Email address</div>
          <input
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="w-full rounded-xl border border-[#2a2a39] bg-[#171722] px-3 py-3 text-sm text-white outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40"
        >
          {isSaving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </section>
  );
}
