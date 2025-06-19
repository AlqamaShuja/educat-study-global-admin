import { format, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

const formatters = {
  // Format date to local date string (e.g., "MM/dd/yyyy")
  formatDate(date, pattern = "MM/dd/yyyy") {
    if (!date) return "N/A";
    try {
      const parsedDate =
        typeof date === "string" ? parseISO(date) : new Date(date);
      return format(parsedDate, pattern);
    } catch {
      return "Invalid Date";
    }
  },

  // Format date and time to local string (e.g., "MM/dd/yyyy HH:mm:ss")
  formatDateTime(date, pattern = "MM/dd/yyyy HH:mm:ss") {
    if (!date) return "N/A";
    try {
      const parsedDate =
        typeof date === "string" ? parseISO(date) : new Date(date);
      return format(parsedDate, pattern);
    } catch {
      return "Invalid DateTime";
    }
  },

  // Format date to timezone-specific string
  formatDateInTimezone(date, timezone, pattern = "MM/dd/yyyy HH:mm:ss") {
    if (!date || !timezone) return "N/A";
    try {
      const parsedDate =
        typeof date === "string" ? parseISO(date) : new Date(date);
      const zonedDate = utcToZonedTime(parsedDate, timezone);
      return format(zonedDate, pattern);
    } catch {
      return "Invalid DateTime";
    }
  },

  // Format currency (e.g., "$1,234.56")
  formatCurrency(amount, currency = "USD", locale = "en-US") {
    if (amount == null) return "N/A";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(amount);
    } catch {
      return amount.toString();
    }
  },

  // Format number with thousands separator (e.g., "1,234")
  formatNumber(number, locale = "en-US") {
    if (number == null) return "N/A";
    try {
      return new Intl.NumberFormat(locale).format(number);
    } catch {
      return number.toString();
    }
  },

  // Format percentage (e.g., "12.34%")
  formatPercentage(value, decimals = 2, locale = "en-US") {
    if (value == null) return "N/A";
    try {
      return new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value / 100);
    } catch {
      return `${value}%`;
    }
  },

  // Format phone number (e.g., "+1-234-567-8900")
  formatPhoneNumber(phone) {
    if (!phone) return "N/A";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(
        4,
        7
      )}-${cleaned.slice(7)}`;
    }
    return phone;
  },

  // Format email (lowercase and trimmed)
  formatEmail(email) {
    if (!email) return "N/A";
    return email.toLowerCase().trim();
  },

  // Capitalize first letter of each word
  capitalizeWords(str) {
    if (!str) return "N/A";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },

  // Truncate text with ellipsis
  truncateText(text, maxLength = 50) {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
  },

  // Format file size (e.g., "1.23 MB")
  formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return "N/A";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  },

  // Format status badge text
  formatStatus(status) {
    if (!status) return "N/A";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },
};

export default formatters;
