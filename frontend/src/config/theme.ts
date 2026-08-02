import { createTheme } from "@mui/material/styles";

/**
 * Design tokens pulled from the Verascan screenshots:
 * - Near-black app background, slightly lighter card/panel surfaces
 * - Indigo -> violet gradient as the primary accent ("New evaluation" button)
 * - Subtle 1px borders, rounded corners on cards
 * - Status colors: green (match/correct), red (mismatch/incorrect),
 *   amber (missing/pending), blue (additional)
 */

export const colors = {
  background: "#0a0a0f",
  surface: "#12121a",
  surfaceElevated: "#181822",
  border: "#232330",
  borderSubtle: "#1c1c26",
  textPrimary: "#f5f5f7",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
  accentStart: "#6366f1",
  accentEnd: "#8b5cf6",
  success: "#10b981",
  successBg: "rgba(16, 185, 129, 0.12)",
  error: "#ef4444",
  errorBg: "rgba(239, 68, 68, 0.12)",
  warning: "#f59e0b",
  warningBg: "rgba(245, 158, 11, 0.12)",
  info: "#3b82f6",
  infoBg: "rgba(59, 130, 246, 0.12)",
};

export const accentGradient = `linear-gradient(135deg, ${colors.accentStart} 0%, ${colors.accentEnd} 100%)`;

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    primary: {
      main: colors.accentStart,
      light: colors.accentEnd,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    success: { main: colors.success },
    error: { main: colors.error },
    warning: { main: colors.warning },
    info: { main: colors.info },
    divider: colors.border,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          "&.MuiButton-containedPrimary": {
            backgroundImage: accentGradient,
          },
          "&.MuiButton-containedPrimary:hover": {
            backgroundImage: accentGradient,
            opacity: 0.9,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surfaceElevated,
          borderRadius: 8,
          "& fieldset": { borderColor: colors.border },
          "&:hover fieldset": { borderColor: colors.textMuted },
          "&.Mui-focused fieldset": { borderColor: colors.accentStart },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { backgroundColor: colors.surfaceElevated, borderRadius: 8 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surfaceElevated,
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: colors.surface,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { padding: 8 },
        switchBase: {
          "&.Mui-checked": { color: "#fff" },
          "&.Mui-checked + .MuiSwitch-track": {
            backgroundImage: accentGradient,
            opacity: 1,
          },
        },
        track: { backgroundColor: colors.border, opacity: 1 },
      },
    },
  },
});
