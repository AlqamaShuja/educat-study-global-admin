/**
 * Debounce function to limit function calls
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle function to limit function calls
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone an object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Deep merge objects
 */
export const deepMerge = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

/**
 * Check if value is an object
 */
export const isObject = (item) => {
  return item && typeof item === "object" && !Array.isArray(item);
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Convert camelCase to snake_case
 */
export const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Convert snake_case to camelCase
 */
export const snakeToCamel = (str) => {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );
};

/**
 * Convert string to kebab-case
 */
export const toKebabCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

/**
 * Generate random string
 */
export const generateRandomString = (
  length = 8,
  includeNumbers = true,
  includeSymbols = false
) => {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  if (includeNumbers) chars += "0123456789";
  if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate UUID v4
 */
export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str, length = 100, suffix = "...") => {
  if (!str || typeof str !== "string") return "";
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
};

/**
 * Extract initials from name
 */
export const getInitials = (name, maxInitials = 2) => {
  if (!name || typeof name !== "string") return "";

  const names = name.trim().split(" ").filter(Boolean);
  const initials = names.map((n) => n.charAt(0).toUpperCase());

  return initials.slice(0, maxInitials).join("");
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Format number with commas
 */
export const formatNumber = (num, locale = "en-US") => {
  if (typeof num !== "number") return "";
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = "USD", locale = "en-US") => {
  if (typeof amount !== "number") return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== "number") return "";
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Parse query string to object
 */
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};

  for (const [key, value] of params) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
};

/**
 * Convert object to query string
 */
export const objectToQueryString = (obj) => {
  const params = new URLSearchParams();

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else {
        params.append(key, value);
      }
    }
  });

  return params.toString();
};

/**
 * Sleep/delay function
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Get nested object property safely
 */
export const getNestedProperty = (obj, path, defaultValue = undefined) => {
  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined || !(key in result)) {
      return defaultValue;
    }
    result = result[key];
  }

  return result;
};

/**
 * Set nested object property
 */
export const setNestedProperty = (obj, path, value) => {
  const keys = path.split(".");
  const lastKey = keys.pop();
  let current = obj;

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
  return obj;
};

/**
 * Remove duplicates from array
 */
export const removeDuplicates = (arr, key = null) => {
  if (!Array.isArray(arr)) return [];

  if (key) {
    const seen = new Set();
    return arr.filter((item) => {
      const value = getNestedProperty(item, key);
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  return [...new Set(arr)];
};

/**
 * Sort array of objects by property
 */
export const sortBy = (arr, key, direction = "asc") => {
  if (!Array.isArray(arr)) return [];

  return [...arr].sort((a, b) => {
    const aVal = getNestedProperty(a, key);
    const bVal = getNestedProperty(b, key);

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Group array of objects by property
 */
export const groupBy = (arr, key) => {
  if (!Array.isArray(arr)) return {};

  return arr.reduce((groups, item) => {
    const value = getNestedProperty(item, key);
    const group = groups[value] || [];
    group.push(item);
    groups[value] = group;
    return groups;
  }, {});
};

/**
 * Chunk array into smaller arrays
 */
export const chunk = (arr, size) => {
  if (!Array.isArray(arr) || size <= 0) return [];

  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/**
 * Flatten nested array
 */
export const flatten = (arr, depth = 1) => {
  if (!Array.isArray(arr)) return [];

  return depth > 0
    ? arr.reduce(
        (acc, val) =>
          acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val),
        []
      )
    : arr.slice();
};

/**
 * Get random item from array
 */
export const getRandomItem = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Shuffle array
 */
export const shuffle = (arr) => {
  if (!Array.isArray(arr)) return [];

  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Check if string is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if string is valid phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
};

/**
 * Check if string is valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize HTML string
 */
export const sanitizeHtml = (html) => {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

/**
 * Download file from blob
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Convert array of objects to CSV
 */
export const arrayToCSV = (data, headers = null) => {
  if (!Array.isArray(data) || data.length === 0) return "";

  const csvHeaders = headers || Object.keys(data[0]);
  const csvData = data.map((row) =>
    csvHeaders
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes("\n") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",")
  );

  return [csvHeaders.join(","), ...csvData].join("\n");
};

/**
 * Get browser info
 */
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let version = "Unknown";

  if (ua.includes("Chrome")) {
    browser = "Chrome";
    version = ua.match(/Chrome\/(\d+)/)?.[1] || "Unknown";
  } else if (ua.includes("Firefox")) {
    browser = "Firefox";
    version = ua.match(/Firefox\/(\d+)/)?.[1] || "Unknown";
  } else if (ua.includes("Safari")) {
    browser = "Safari";
    version = ua.match(/Version\/(\d+)/)?.[1] || "Unknown";
  } else if (ua.includes("Edge")) {
    browser = "Edge";
    version = ua.match(/Edge\/(\d+)/)?.[1] || "Unknown";
  }

  return { browser, version, userAgent: ua };
};

/**
 * Get device info
 */
export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    platform: navigator.platform,
    language: navigator.language,
  };
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
  const criteria = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(criteria).filter(Boolean).length;
  let strength = "Very Weak";

  if (score >= 5) strength = "Very Strong";
  else if (score >= 4) strength = "Strong";
  else if (score >= 3) strength = "Medium";
  else if (score >= 2) strength = "Weak";

  return { criteria, score, strength };
};

/**
 * Convert object keys to different cases
 */
export const convertObjectKeys = (obj, converter) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertObjectKeys(item, converter));
  }

  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = converter(key);
      result[newKey] = convertObjectKeys(obj[key], converter);
      return result;
    }, {});
  }

  return obj;
};

/**
 * Mask sensitive data
 */
export const maskData = (value, type = "default", visibleChars = 4) => {
  if (!value || typeof value !== "string") return value;

  switch (type) {
    case "email":
      const [local, domain] = value.split("@");
      if (!domain) return value;
      const maskedLocal =
        local.length > 2
          ? local.substring(0, 2) + "*".repeat(local.length - 2)
          : local;
      return `${maskedLocal}@${domain}`;

    case "phone":
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length < 4) return value;
      return (
        cleaned.substring(0, 3) +
        "*".repeat(cleaned.length - 6) +
        cleaned.substring(cleaned.length - 3)
      );

    case "card":
      const cardCleaned = value.replace(/\s/g, "");
      if (cardCleaned.length < 8) return value;
      return (
        "*".repeat(cardCleaned.length - 4) +
        cardCleaned.substring(cardCleaned.length - 4)
      );

    default:
      if (value.length <= visibleChars * 2) return value;
      return (
        value.substring(0, visibleChars) +
        "*".repeat(value.length - visibleChars * 2) +
        value.substring(value.length - visibleChars)
      );
  }
};

/**
 * Compare two objects for equality
 */
export const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return false;

  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== "object") return obj1 === obj2;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};

export const REGIONS = [
  { value: "north_america", label: "North America" },
  { value: "south_america", label: "South America" },
  { value: "europe", label: "Europe" },
  { value: "asia_pacific", label: "Asia Pacific" },
  { value: "middle_east", label: "Middle East" },
  { value: "africa", label: "Africa" },
  { value: "oceania", label: "Oceania" },
];
