export const theme = {
  light: {
    background: "#ffffff",
    foreground: "#1f2937",
    primary: "#3b82f6",
    primaryLight: "#bfdbfe",
    secondary: "#6b7280",
    secondaryForeground: "#ffffff",
    destructive: "#ef4444",
    border: "#d1d5db",
    input: "#f9fafb",
    shadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    backgroundHover: "#f3f4f6",
    textSecondary: "#6b7280",
  },
  dark: {
    background: "#1f2937",
    foreground: "#f9fafb",
    primary: "#60a5fa",
    primaryLight: "#1e40af",
    secondary: "#4b5563",
    secondaryForeground: "#f9fafb",
    destructive: "#b91c1c",
    border: "#374151",
    input: "#374151",
    shadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    backgroundHover: "#374151",
    textSecondary: "#9ca3af",
  },
};

// Utility to get the current theme based on user preference or system setting
export const getTheme = (mode = "light") => {
  return theme[mode] || theme.light;
};
