import { useEffect, useMemo, useState } from "react";
import { authService } from "../../../services/authService";
import { settingsService, type OcrEngine, type UserSettings } from "../../../services/settingsService";

export function useSettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [engines, setEngines] = useState<OcrEngine[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [defaultEngineId, setDefaultEngineId] = useState<number | null>(null);
  const [language, setLanguage] = useState("English");
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [completionAlerts, setCompletionAlerts] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [defaultExportFormat, setDefaultExportFormat] = useState<UserSettings["default_export_fmt"]>("pdf");
  const [includeOriginal, setIncludeOriginal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [settingsPayload, engineList, me] = await Promise.all([
          settingsService.getSettings(),
          settingsService.listEngines(),
          authService.me(),
        ]);

        if (!active) return;

        setSettings(settingsPayload);
        setEngines(engineList);
        setFullName(me.name);
        setEmail(me.email);
        setDefaultEngineId(settingsPayload.default_engine_id);
        setLanguage(settingsPayload.language);
        setEmailAlerts(settingsPayload.email_alerts);
        setCompletionAlerts(settingsPayload.completion_alerts);
        setWeeklySummary(settingsPayload.weekly_summary);
        setDefaultExportFormat(settingsPayload.default_export_fmt);
        setIncludeOriginal(settingsPayload.include_original);
      } catch (loadError) {
        if (!active) return;
        setErrorMessage(loadError instanceof Error ? loadError.message : "Unable to load settings.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const profileSummary = useMemo(() => {
    return {
      name: fullName,
      email,
    };
  }, [email, fullName]);

  const saveProfile = async () => {
    if (!settings) return;
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await authService.updateProfile(settings.user_id, {
        name: fullName,
        email,
      });

      setSuccessMessage(`Profile updated for ${response.name}.`);
    } catch (saveError) {
      setErrorMessage(saveError instanceof Error ? saveError.message : "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (!settings) return;

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password confirmation does not match.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await authService.changePassword(settings.user_id, {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Password changed successfully.");
    } catch (saveError) {
      setErrorMessage(saveError instanceof Error ? saveError.message : "Unable to update password.");
    } finally {
      setIsSaving(false);
    }
  };

  const savePreferences = async () => {
    if (!settings) return;
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await settingsService.updateSettings({
        default_engine_id: defaultEngineId,
        language,
        email_alerts: emailAlerts,
        completion_alerts: completionAlerts,
        weekly_summary: weeklySummary,
        default_export_fmt: defaultExportFormat,
        include_original: includeOriginal,
      });

      setSettings(updated);
      setSuccessMessage("Workspace preferences saved.");
    } catch (saveError) {
      setErrorMessage(saveError instanceof Error ? saveError.message : "Unable to update preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    engines,
    settings,
    profileSummary,
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
  };
}
