const configuredApiBaseUrl =
  import.meta.env.MODE === "capacitor"
    ? import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "")
    : undefined;

export const API_BASE_URL = configuredApiBaseUrl ?? "";
