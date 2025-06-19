import Papa from "papaparse";

const fileUtils = {
  // Parse CSV file to JSON
  parseCSV(file, options = {}) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transform: (value) => value.trim(),
        ...options,
        complete: (result) => {
          if (result.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${result.errors[0].message}`));
          } else {
            resolve(result.data);
          }
        },
        error: (error) => reject(error),
      });
    });
  },

  // Generate CSV from JSON data
  generateCSV(data, filename = "export.csv") {
    const csv = Papa.unparse(data, {
      quotes: true,
      delimiter: ",",
      header: true,
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.click();
    window.URL.revokeObjectURL(url);
  },

  // Validate file type
  isValidFileType(file, allowedTypes = []) {
    return allowedTypes.includes(file.type.toLowerCase());
  },

  // Validate file size (in bytes)
  isValidFileSize(file, maxSizeBytes) {
    return file.size <= maxSizeBytes;
  },

  // Read file as text
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  },

  // Read file as Data URL (for images)
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  },

  // Download file from URL
  downloadFile(url, filename) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  },

  // Validate CSV headers
  validateCSVHeaders(parsedData, requiredHeaders = [], optionalHeaders = []) {
    if (!parsedData || parsedData.length === 0) {
      return { isValid: false, error: "No data found in CSV" };
    }

    const headers = Object.keys(parsedData[0]);
    const missingRequired = requiredHeaders.filter(
      (header) => !headers.includes(header)
    );

    if (missingRequired.length > 0) {
      return {
        isValid: false,
        error: `Missing required headers: ${missingRequired.join(", ")}`,
      };
    }

    const invalidHeaders = headers.filter(
      (header) =>
        !requiredHeaders.includes(header) && !optionalHeaders.includes(header)
    );

    if (invalidHeaders.length > 0) {
      return {
        isValid: false,
        error: `Invalid headers found: ${invalidHeaders.join(", ")}`,
      };
    }

    return { isValid: true };
  },

  // Sanitize filename
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_{2,}/g, "_")
      .substring(0, 100);
  },
};

export default fileUtils;
