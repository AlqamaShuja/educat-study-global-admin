import {
  format,
  parseISO,
  isValid,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  addDays,
  addHours,
  addMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isBefore,
  isAfter,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  getDay,
  getWeek,
  getMonth,
  getYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";

/**
 * Format date to display string
 */
export const formatDate = (date, formatString = "PP") => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";
    return format(dateObj, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Format date and time to display string
 */
export const formatDateTime = (date, formatString = "PPp") => {
  return formatDate(date, formatString);
};

/**
 * Format time only
 */
export const formatTime = (date, formatString = "p") => {
  return formatDate(date, formatString);
};

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export const formatDateInput = (date) => {
  return formatDate(date, "yyyy-MM-dd");
};

/**
 * Format datetime for input fields (YYYY-MM-DDTHH:mm)
 */
export const formatDateTimeInput = (date) => {
  return formatDate(date, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date) => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";

    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, dateObj);
    const diffInHours = differenceInHours(now, dateObj);
    const diffInDays = differenceInDays(now, dateObj);

    if (Math.abs(diffInMinutes) < 1) {
      return "Just now";
    } else if (Math.abs(diffInMinutes) < 60) {
      return diffInMinutes > 0
        ? `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
        : `in ${Math.abs(diffInMinutes)} minute${
            Math.abs(diffInMinutes) !== 1 ? "s" : ""
          }`;
    } else if (Math.abs(diffInHours) < 24) {
      return diffInHours > 0
        ? `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
        : `in ${Math.abs(diffInHours)} hour${
            Math.abs(diffInHours) !== 1 ? "s" : ""
          }`;
    } else if (Math.abs(diffInDays) < 7) {
      return diffInDays > 0
        ? `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
        : `in ${Math.abs(diffInDays)} day${
            Math.abs(diffInDays) !== 1 ? "s" : ""
          }`;
    } else {
      return formatDate(dateObj, "PP");
    }
  } catch (error) {
    console.error("Error getting relative time:", error);
    return "";
  }
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isSameDay(dateObj, new Date());
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is tomorrow
 */
export const isTomorrow = (date) => {
  if (!date) return false;
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const tomorrow = addDays(new Date(), 1);
    return isSameDay(dateObj, tomorrow);
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is yesterday
 */
export const isYesterday = (date) => {
  if (!date) return false;
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const yesterday = subDays(new Date(), 1);
    return isSameDay(dateObj, yesterday);
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is this week
 */
export const isThisWeek = (date) => {
  if (!date) return false;
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isSameWeek(dateObj, new Date());
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is this month
 */
export const isThisMonth = (date) => {
  if (!date) return false;
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isSameMonth(dateObj, new Date());
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is this year
 */
export const isThisYear = (date) => {
  if (!date) return false;
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isSameYear(dateObj, new Date());
  } catch (error) {
    return false;
  }
};

/**
 * Get date ranges for common periods
 */
export const getDateRange = (period) => {
  const now = new Date();

  switch (period) {
    case "today":
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };

    case "yesterday":
      const yesterday = subDays(now, 1);
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      };

    case "thisWeek":
      return {
        start: startOfWeek(now),
        end: endOfWeek(now),
      };

    case "lastWeek":
      const lastWeekStart = startOfWeek(subWeeks(now, 1));
      const lastWeekEnd = endOfWeek(subWeeks(now, 1));
      return {
        start: lastWeekStart,
        end: lastWeekEnd,
      };

    case "thisMonth":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };

    case "lastMonth":
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      return {
        start: lastMonthStart,
        end: lastMonthEnd,
      };

    case "thisYear":
      return {
        start: startOfYear(now),
        end: endOfYear(now),
      };

    case "lastYear":
      const lastYearStart = startOfYear(subYears(now, 1));
      const lastYearEnd = endOfYear(subYears(now, 1));
      return {
        start: lastYearStart,
        end: lastYearEnd,
      };

    case "last7Days":
      return {
        start: startOfDay(subDays(now, 6)),
        end: endOfDay(now),
      };

    case "last30Days":
      return {
        start: startOfDay(subDays(now, 29)),
        end: endOfDay(now),
      };

    case "last90Days":
      return {
        start: startOfDay(subDays(now, 89)),
        end: endOfDay(now),
      };

    default:
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
  }
};

/**
 * Check if a date is within a date range
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const startObj =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const endObj = typeof endDate === "string" ? parseISO(endDate) : endDate;

    return !isBefore(dateObj, startObj) && !isAfter(dateObj, endObj);
  } catch (error) {
    return false;
  }
};

/**
 * Get business days between two dates (excluding weekends)
 */
export const getBusinessDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  try {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    let count = 0;
    let current = start;

    while (!isAfter(current, end)) {
      const dayOfWeek = getDay(current);
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current = addDays(current, 1);
    }

    return count;
  } catch (error) {
    return 0;
  }
};

/**
 * Add business days to a date (excluding weekends)
 */
export const addBusinessDays = (date, days) => {
  if (!date || days <= 0) return date;

  try {
    let current = typeof date === "string" ? parseISO(date) : date;
    let remaining = days;

    while (remaining > 0) {
      current = addDays(current, 1);
      const dayOfWeek = getDay(current);

      // Skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        remaining--;
      }
    }

    return current;
  } catch (error) {
    return date;
  }
};

/**
 * Get the next business day
 */
export const getNextBusinessDay = (date = new Date()) => {
  try {
    let next = addDays(date, 1);
    const dayOfWeek = getDay(next);

    // If it's Saturday, move to Monday
    if (dayOfWeek === 6) {
      next = addDays(next, 2);
    }
    // If it's Sunday, move to Monday
    else if (dayOfWeek === 0) {
      next = addDays(next, 1);
    }

    return next;
  } catch (error) {
    return addDays(new Date(), 1);
  }
};

/**
 * Check if a date is a business day (Monday-Friday)
 */
export const isBusinessDay = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const dayOfWeek = getDay(dateObj);
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  } catch (error) {
    return false;
  }
};

/**
 * Get time zone offset in hours
 */
export const getTimeZoneOffset = () => {
  return new Date().getTimezoneOffset() / -60;
};

/**
 * Convert UTC date to local time
 */
export const utcToLocal = (utcDate) => {
  if (!utcDate) return null;

  try {
    const date = typeof utcDate === "string" ? parseISO(utcDate) : utcDate;
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  } catch (error) {
    return null;
  }
};

/**
 * Convert local date to UTC
 */
export const localToUtc = (localDate) => {
  if (!localDate) return null;

  try {
    const date =
      typeof localDate === "string" ? parseISO(localDate) : localDate;
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  } catch (error) {
    return null;
  }
};

/**
 * Get age from birth date
 */
export const getAge = (birthDate) => {
  if (!birthDate) return 0;

  try {
    const birth =
      typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  } catch (error) {
    return 0;
  }
};

/**
 * Get duration between two dates in human readable format
 */
export const getDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "";

  try {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    const diffInMinutes = Math.abs(differenceInMinutes(end, start));
    const diffInHours = Math.abs(differenceInHours(end, start));
    const diffInDays = Math.abs(differenceInDays(end, start));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""}`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""}`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""}`;
    }
  } catch (error) {
    return "";
  }
};

/**
 * Check if date is overdue
 */
export const isOverdue = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return isBefore(dateObj, new Date());
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is due soon (within specified days)
 */
export const isDueSoon = (date, daysThreshold = 3) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const threshold = addDays(new Date(), daysThreshold);
    return !isBefore(dateObj, new Date()) && !isAfter(dateObj, threshold);
  } catch (error) {
    return false;
  }
};

/**
 * Generate date options for select inputs
 */
export const generateDateOptions = (startDate, endDate, step = 1) => {
  const options = [];

  try {
    let current =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

    while (!isAfter(current, end)) {
      options.push({
        value: formatDateInput(current),
        label: formatDate(current, "PP"),
      });
      current = addDays(current, step);
    }
  } catch (error) {
    console.error("Error generating date options:", error);
  }

  return options;
};

/**
 * Get calendar weeks for a month
 */
export const getCalendarWeeks = (date) => {
  try {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const weeks = [];
    let current = calendarStart;

    while (!isAfter(current, calendarEnd)) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(current);
        current = addDays(current, 1);
      }
      weeks.push(week);
    }

    return weeks;
  } catch (error) {
    return [];
  }
};

/**
 * Parse flexible date input
 */
export const parseFlexibleDate = (input) => {
  if (!input) return null;

  // If already a Date object
  if (input instanceof Date) {
    return isValid(input) ? input : null;
  }

  // If ISO string
  if (typeof input === "string") {
    try {
      const parsed = parseISO(input);
      if (isValid(parsed)) return parsed;

      // Try native Date parsing as fallback
      const nativeParsed = new Date(input);
      if (isValid(nativeParsed)) return nativeParsed;
    } catch (error) {
      // Continue to return null
    }
  }

  return null;
};

/**
 * Format date range to string
 */
export const formatDateRange = (startDate, endDate, separator = " - ") => {
  if (!startDate || !endDate) return "";

  try {
    const start = formatDate(startDate, "PP");
    const end = formatDate(endDate, "PP");

    if (isSameDay(parseFlexibleDate(startDate), parseFlexibleDate(endDate))) {
      return start;
    }

    return `${start}${separator}${end}`;
  } catch (error) {
    return "";
  }
};
