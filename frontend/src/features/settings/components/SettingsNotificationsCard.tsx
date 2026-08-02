import { Bell } from "lucide-react";

interface SettingsNotificationsCardProps {
  emailAlerts: boolean;
  completionAlerts: boolean;
  weeklySummary: boolean;
  onEmailAlertsChange: (value: boolean) => void;
  onCompletionAlertsChange: (value: boolean) => void;
  onWeeklySummaryChange: (value: boolean) => void;
}

export function SettingsNotificationsCard({
  emailAlerts,
  completionAlerts,
  weeklySummary,
  onEmailAlertsChange,
  onCompletionAlertsChange,
  onWeeklySummaryChange,
}: SettingsNotificationsCardProps) {
  return (
    <section className="rounded-2xl border border-[#222334] bg-[#10111a] p-5">
      <div className="mb-4 flex items-center gap-3 text-white">
        <div className="rounded-lg bg-[#1a1a28] p-2 text-[#9ca3af]">
          <Bell className="h-4 w-4" />
        </div>
        <div className="text-lg font-semibold">Notifications</div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-[#23283a] bg-[#111420] px-4 py-3">
          <div>
            <div className="text-sm font-medium text-white">Email alerts</div>
            <div className="text-xs text-[#7b8494]">Receive an email for account and security events</div>
          </div>
          <button
            type="button"
            onClick={() => onEmailAlertsChange(!emailAlerts)}
            className={`relative h-6 w-11 rounded-full transition ${emailAlerts ? "bg-[#3b82f6]" : "bg-[#2a2a39]"}`}
          >
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${emailAlerts ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#23283a] bg-[#111420] px-4 py-3">
          <div>
            <div className="text-sm font-medium text-white">Evaluation completion</div>
            <div className="text-xs text-[#7b8494]">Notify when OCR processing finishes</div>
          </div>
          <button
            type="button"
            onClick={() => onCompletionAlertsChange(!completionAlerts)}
            className={`relative h-6 w-11 rounded-full transition ${completionAlerts ? "bg-[#3b82f6]" : "bg-[#2a2a39]"}`}
          >
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${completionAlerts ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#23283a] bg-[#111420] px-4 py-3">
          <div>
            <div className="text-sm font-medium text-white">Weekly summary</div>
            <div className="text-xs text-[#7b8494]">A weekly digest of evaluation activity</div>
          </div>
          <button
            type="button"
            onClick={() => onWeeklySummaryChange(!weeklySummary)}
            className={`relative h-6 w-11 rounded-full transition ${weeklySummary ? "bg-[#3b82f6]" : "bg-[#2a2a39]"}`}
          >
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${weeklySummary ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </div>
    </section>
  );
}
