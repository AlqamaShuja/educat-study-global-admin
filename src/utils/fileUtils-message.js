// src/utils/fileUtils.js

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${
    sizes[i]
  }`;
};

/**
 * Get file type category
 * @param {string} mimeType - MIME type of the file
 * @returns {string} - File category
 */
export const getFileCategory = (mimeType) => {
  if (!mimeType) return "unknown";

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";

  const documentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
  ];

  if (documentTypes.includes(mimeType)) return "document";

  const archiveTypes = [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/gzip",
    "application/x-tar",
  ];

  if (archiveTypes.includes(mimeType)) return "archive";

  return "file";
};

/**
 * Get file icon based on type
 * @param {string} mimeType - MIME type of the file
 * @param {string} fileName - Name of the file
 * @returns {string} - Icon name or emoji
 */
export const getFileIcon = (mimeType, fileName = "") => {
  const category = getFileCategory(mimeType);

  switch (category) {
    case "image":
      return "🖼️";
    case "video":
      return "🎥";
    case "audio":
      return "🎵";
    case "archive":
      return "📦";
    case "document":
      if (mimeType === "application/pdf") return "📄";
      if (mimeType.includes("word")) return "📝";
      if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
        return "📊";
      if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
        return "📋";
      return "📄";
    default:
      return "📎";
  }
};

/**
 * Validate file type
 * @param {File} file - File object
 * @param {Array} allowedTypes - Array of allowed MIME types or extensions
 * @returns {Object} - Validation result
 */
export const validateFileType = (file, allowedTypes = []) => {
  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  if (allowedTypes.length === 0 || allowedTypes.includes("*/*")) {
    return { isValid: true };
  }

  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  const isAllowed = allowedTypes.some((type) => {
    // Check by extension
    if (type.startsWith(".")) {
      return fileName.endsWith(type.toLowerCase());
    }

    // Check by MIME type
    if (type.includes("*")) {
      const pattern = type.replace("*", ".*");
      return new RegExp(`^${pattern}$`).test(mimeType);
    }

    return mimeType === type.toLowerCase();
  });

  return {
    isValid: isAllowed,
    error: isAllowed ? null : `File type '${mimeType}' is not allowed`,
  };
};

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSize - Maximum size in bytes
 * @param {number} minSize - Minimum size in bytes
 * @returns {Object} - Validation result
 */
export const validateFileSize = (file, maxSize = Infinity, minSize = 0) => {
  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(
        file.size
      )}) exceeds maximum allowed size (${formatFileSize(maxSize)})`,
    };
  }

  if (file.size < minSize) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(
        file.size
      )}) is below minimum required size (${formatFileSize(minSize)})`,
    };
  }

  return { isValid: true };
};

/**
 * Comprehensive file validation
 * @param {File} file - File object
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    allowedTypes = [],
    maxSize = 50 * 1024 * 1024, // 50MB default
    minSize = 0,
    allowedExtensions = [],
    blockedExtensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".com"],
    maxNameLength = 255,
  } = options;

  const errors = [];
  const warnings = [];

  // Basic file check
  if (!file) {
    errors.push("No file provided");
    return { isValid: false, errors, warnings };
  }

  // File name validation
  if (file.name.length > maxNameLength) {
    errors.push(`File name too long (max ${maxNameLength} characters)`);
  }

  // Check for blocked extensions
  const fileExtension = getFileExtension(file.name);
  if (blockedExtensions.includes(fileExtension.toLowerCase())) {
    errors.push(
      `File type '${fileExtension}' is not allowed for security reasons`
    );
  }

  // File type validation
  if (allowedTypes.length > 0) {
    const typeValidation = validateFileType(file, allowedTypes);
    if (!typeValidation.isValid) {
      errors.push(typeValidation.error);
    }
  }

  // Extension validation
  if (allowedExtensions.length > 0) {
    const hasAllowedExtension = allowedExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext.toLowerCase())
    );
    if (!hasAllowedExtension) {
      errors.push(
        `File extension must be one of: ${allowedExtensions.join(", ")}`
      );
    }
  }

  // File size validation
  const sizeValidation = validateFileSize(file, maxSize, minSize);
  if (!sizeValidation.isValid) {
    errors.push(sizeValidation.error);
  }

  // Security warnings
  const suspiciousExtensions = [".js", ".html", ".htm", ".php", ".asp", ".jsp"];
  if (suspiciousExtensions.includes(fileExtension.toLowerCase())) {
    warnings.push("This file type may contain executable code");
  }

  // Large file warning
  if (file.size > 10 * 1024 * 1024) {
    // 10MB
    warnings.push("Large file may take time to upload");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get file extension from filename
 * @param {string} fileName - File name
 * @returns {string} - File extension including the dot
 */
export const getFileExtension = (fileName) => {
  if (!fileName) return "";
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.substring(lastDot);
};

/**
 * Generate unique filename to prevent conflicts
 * @param {string} originalName - Original filename
 * @param {Array} existingNames - Array of existing filenames
 * @returns {string} - Unique filename
 */
export const generateUniqueFileName = (originalName, existingNames = []) => {
  if (!existingNames.includes(originalName)) {
    return originalName;
  }

  const extension = getFileExtension(originalName);
  const baseName = originalName.substring(
    0,
    originalName.length - extension.length
  );

  let counter = 1;
  let newName;

  do {
    newName = `${baseName} (${counter})${extension}`;
    counter++;
  } while (existingNames.includes(newName));

  return newName;
};

/**
 * Create file preview URL
 * @param {File} file - File object
 * @returns {string|null} - Preview URL or null if not previewable
 */
export const createFilePreview = (file) => {
  if (!file) return null;

  const category = getFileCategory(file.type);

  if (category === "image") {
    return URL.createObjectURL(file);
  }

  // For other file types, you might want to generate thumbnails
  // or return a placeholder image URL
  return null;
};

/**
 * Read file as text
 * @param {File} file - File object
 * @returns {Promise<string>} - File content as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};

/**
 * Read file as data URL
 * @param {File} file - File object
 * @returns {Promise<string>} - File content as data URL
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Compress image file
 * @param {File} file - Image file
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      outputFormat = "image/jpeg",
    } = options;

    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: outputFormat,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error("Compression failed"));
          }
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate upload time estimate
 * @param {number} fileSize - File size in bytes
 * @param {number} uploadSpeed - Upload speed in bytes per second
 * @returns {Object} - Time estimate object
 */
export const calculateUploadTime = (fileSize, uploadSpeed = 1024 * 1024) => {
  if (!fileSize || !uploadSpeed) {
    return { seconds: 0, display: "Unknown" };
  }

  const seconds = Math.ceil(fileSize / uploadSpeed);

  if (seconds < 60) {
    return { seconds, display: `${seconds}s` };
  } else if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return { seconds, display: `${minutes}m` };
  } else {
    const hours = Math.ceil(seconds / 3600);
    return { seconds, display: `${hours}h` };
  }
};

/**
 * Get MIME type from file extension
 * @param {string} fileName - File name
 * @returns {string} - MIME type
 */
export const getMimeTypeFromExtension = (fileName) => {
  const extension = getFileExtension(fileName).toLowerCase();

  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".avi": "video/avi",
    ".mov": "video/quicktime",
    ".wmv": "video/x-ms-wmv",
    ".flv": "video/x-flv",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac",
    ".aac": "audio/aac",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx":
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".html": "text/html",
    ".xml": "text/xml",
    ".json": "application/json",
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
    ".7z": "application/x-7z-compressed",
    ".tar": "application/x-tar",
    ".gz": "application/gzip",
  };

  return mimeTypes[extension] || "application/octet-stream";
};

/**
 * Check if file can be previewed in browser
 * @param {string} mimeType - MIME type
 * @returns {boolean} - True if file can be previewed
 */
export const canPreviewFile = (mimeType) => {
  const previewableTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "application/pdf",
    "text/plain",
  ];

  return previewableTypes.includes(mimeType);
};

/**
 * Extract metadata from file
 * @param {File} file - File object
 * @returns {Promise<Object>} - File metadata
 */
export const extractFileMetadata = async (file) => {
  const metadata = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified),
    extension: getFileExtension(file.name),
    category: getFileCategory(file.type),
  };

  // For images, we can extract additional metadata
  if (file.type.startsWith("image/")) {
    try {
      const dataUrl = await readFileAsDataURL(file);
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      metadata.dimensions = {
        width: img.width,
        height: img.height,
      };
    } catch (error) {
      console.warn("Failed to extract image dimensions:", error);
    }
  }

  return metadata;
};

export default {
  formatFileSize,
  getFileCategory,
  getFileIcon,
  validateFileType,
  validateFileSize,
  validateFile,
  getFileExtension,
  generateUniqueFileName,
  createFilePreview,
  readFileAsText,
  readFileAsDataURL,
  compressImage,
  calculateUploadTime,
  getMimeTypeFromExtension,
  canPreviewFile,
  extractFileMetadata,
};
