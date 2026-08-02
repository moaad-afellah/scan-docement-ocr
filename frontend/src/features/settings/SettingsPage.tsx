import { SettingsProfileCard } from "./components/SettingsProfileCard";
import { SettingsSecurityCard } from "./components/SettingsSecurityCard";
import { SettingsWorkspacePreferencesCard } from "./components/SettingsWorkspacePreferencesCard";
import { SettingsNotificationsCard } from "./components/SettingsNotificationsCard";
import { SettingsExportPreferencesCard } from "./components/SettingsExportPreferencesCard";
import { SettingsSessionCard } from "./components/SettingsSessionCard";
import { useSettingsPage } from "./hooks/useSettingsPage";

export function SettingsPage() {
  const {
    engines,
    fullName,
    email,
    currentPassword,
    newPassword,
    confirmPassword,
    defaultEngineId,
    language,
    emailAlerts,
    completionAlerts,
    weeklySummary,
    defaultExportFormat,
    includeOriginal,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    setFullName,
    setEmail,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setDefaultEngineId,
    setLanguage,
    setEmailAlerts,
    setCompletionAlerts,
    setWeeklySummary,
    setDefaultExportFormat,
    setIncludeOriginal,
    saveProfile,
    changePassword,
    savePreferences,
  } = useSettingsPage();

  return (
    <div className="space-y-6 text-white">
      <div className="mb-4">
        <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">Manage your profile, security, and workspace preferences</p>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-[#442436] bg-[#26121d] px-4 py-3 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-[#20341f] bg-[#122018] px-4 py-3 text-sm text-emerald-200">
          {successMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-[#222334] bg-[#10111a] p-8 text-sm text-[#9ca3af]">
          Loading settings…
        </div>
      ) : (
        <div className="space-y-5">
          <SettingsProfileCard
            fullName={fullName}
            email={email}
            onNameChange={setFullName}
            onEmailChange={setEmail}
            onSave={saveProfile}
            isSaving={isSaving}
          />

          <SettingsSecurityCard
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onChangePassword={changePassword}
            isSaving={isSaving}
          />

          <SettingsWorkspacePreferencesCard
            engines={engines}
            defaultEngineId={defaultEngineId}
            language={language}
            defaultExportFormat={defaultExportFormat}
            onDefaultEngineChange={setDefaultEngineId}
            onLanguageChange={setLanguage}
            onDefaultExportFormatChange={setDefaultExportFormat}
            onSave={savePreferences}
            isSaving={isSaving}
          />

          <SettingsNotificationsCard
            emailAlerts={emailAlerts}
            completionAlerts={completionAlerts}
            weeklySummary={weeklySummary}
            onEmailAlertsChange={setEmailAlerts}
            onCompletionAlertsChange={setCompletionAlerts}
            onWeeklySummaryChange={setWeeklySummary}
          />

          <SettingsExportPreferencesCard
            defaultExportFormat={defaultExportFormat}
            includeOriginal={includeOriginal}
            onDefaultExportFormatChange={setDefaultExportFormat}
            onIncludeOriginalChange={setIncludeOriginal}
            onSave={savePreferences}
            isSaving={isSaving}
          />

          <SettingsSessionCard />
        </div>
      )}
    </div>
  );
}
