/**
 * Central place for environment-driven config.
 *
 * Set VITE_API_BASE_URL in a .env / .env.local file at the project root
 * to override the default. Vite only exposes env vars prefixed with VITE_.
 *
 * Example .env.local:
 *   VITE_API_BASE_URL=http://localhost:5000
 */

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";
