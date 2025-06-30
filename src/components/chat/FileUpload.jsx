import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  File,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  AlertCircle,
  Check,
  Loader2,
  Camera,
  Folder,
} from "lucide-react";

const FileUpload = ({
  onFileSelect,
  onUpload,
  acceptedTypes = "*/*",
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 10,
  showPreview = true,
  showProgress = true,
  disabled = false,
  className = "",
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // File type icons mapping
  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return Image;
    if (fileType.startsWith("video/")) return Video;
    if (fileType.startsWith("audio/")) return Music;
    if (fileType.includes("pdf")) return FileText;
    if (fileType.includes("zip") || fileType.includes("rar")) return Archive;
    return File;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Validate file
  const validateFile = (file) => {
    const errors = [];

    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File size exceeds ${formatFileSize(maxFileSize)}`);
    }

    // Check file type (basic validation)
    if (acceptedTypes !== "*/*") {
      const acceptedArray = acceptedTypes.split(",").map((type) => type.trim());
      const isAccepted = acceptedArray.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace("*", ".*"));
      });

      if (!isAccepted) {
        errors.push("File type not supported");
      }
    }

    return errors;
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    (selectedFiles) => {
      const fileArray = Array.from(selectedFiles);
      const newFiles = [];
      const newErrors = {};

      // Validate each file
      fileArray.forEach((file, index) => {
        const fileId = `${file.name}-${Date.now()}-${index}`;
        const validationErrors = validateFile(file);

        if (validationErrors.length > 0) {
          newErrors[fileId] = validationErrors;
        } else {
          newFiles.push({
            id: fileId,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: "pending",
          });
        }
      });

      // Check total file limit
      if (files.length + newFiles.length > maxFiles) {
        const remainingSlots = maxFiles - files.length;
        if (remainingSlots > 0) {
          setFiles((prev) => [...prev, ...newFiles.slice(0, remainingSlots)]);
          newErrors["limit"] = [`Only ${remainingSlots} more file(s) allowed`];
        } else {
          newErrors["limit"] = [`Maximum ${maxFiles} files allowed`];
        }
      } else {
        setFiles((prev) => [...prev, ...newFiles]);
      }

      setErrors((prev) => ({ ...prev, ...newErrors }));

      // Notify parent component
      if (onFileSelect) {
        newFiles.forEach((fileObj) => onFileSelect(fileObj.file));
      }
    },
    [files.length, maxFiles, maxFileSize, acceptedTypes, onFileSelect]
  );

  // Handle drag events
  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      if (!disabled) {
        const droppedFiles = e.dataTransfer.files;
        handleFileSelect(droppedFiles);
      }
    },
    [disabled, handleFileSelect]
  );

  // Handle input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  // Remove file
  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fileId];
      return newErrors;
    });
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  // Upload file
  const uploadFile = async (fileObj) => {
    if (!onUpload) return;

    setFiles((prev) =>
      prev.map((f) => (f.id === fileObj.id ? { ...f, status: "uploading" } : f))
    );

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const currentProgress = prev[fileObj.id] || 0;
          const newProgress = Math.min(
            currentProgress + Math.random() * 20,
            95
          );
          return { ...prev, [fileObj.id]: newProgress };
        });
      }, 200);

      // Call upload function
      await onUpload(fileObj.file, (progress) => {
        setUploadProgress((prev) => ({ ...prev, [fileObj.id]: progress }));
      });

      // Complete upload
      clearInterval(progressInterval);
      setUploadProgress((prev) => ({ ...prev, [fileObj.id]: 100 }));
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id ? { ...f, status: "completed" } : f
        )
      );

      // Remove file after successful upload
      setTimeout(() => removeFile(fileObj.id), 2000);
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileObj.id ? { ...f, status: "error" } : f))
      );
      setErrors((prev) => ({
        ...prev,
        [fileObj.id]: [error.message || "Upload failed"],
      }));
    }
  };

  // Upload all pending files
  const uploadAllFiles = () => {
    files.forEach((fileObj) => {
      if (fileObj.status === "pending") {
        uploadFile(fileObj);
      }
    });
  };

  // Clear all files
  const clearAllFiles = () => {
    setFiles([]);
    setErrors({});
    setUploadProgress({});
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}
        `}
      >
        <div className="flex flex-col items-center space-y-3">
          <div
            className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${
              dragOver
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-500"
            }
          `}
          >
            {dragOver ? (
              <Upload className="w-8 h-8" />
            ) : (
              <Folder className="w-8 h-8" />
            )}
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {dragOver ? "Drop files here" : "Upload files"}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop files or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max {formatFileSize(maxFileSize)} per file • Up to {maxFiles}{" "}
              files
            </p>
          </div>
        </div>

        {/* Quick Upload Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.setAttribute("accept", "image/*");
              fileInputRef.current?.click();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>Photos</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.setAttribute(
                "accept",
                ".pdf,.doc,.docx,.txt"
              );
              fileInputRef.current?.click();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Documents</span>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Selected Files ({files.length})
            </h3>
            <div className="flex space-x-2">
              {files.some((f) => f.status === "pending") && (
                <button
                  onClick={uploadAllFiles}
                  disabled={disabled}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  Upload All
                </button>
              )}
              <button
                onClick={clearAllFiles}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {files.map((fileObj) => {
              const Icon = getFileIcon(fileObj.type);
              const progress = uploadProgress[fileObj.id] || 0;
              const hasError = errors[fileObj.id];

              return (
                <div
                  key={fileObj.id}
                  className={`
                    flex items-center space-x-3 p-3 border rounded-lg
                    ${
                      hasError
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-white"
                    }
                  `}
                >
                  {/* File Icon */}
                  <div
                    className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${
                      hasError
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {fileObj.name}
                      </h4>
                      <div className="flex items-center space-x-2 ml-2">
                        {/* Status Icon */}
                        {fileObj.status === "uploading" && (
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        )}
                        {fileObj.status === "completed" && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        {(fileObj.status === "error" || hasError) && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFile(fileObj.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(fileObj.size)}
                      </span>

                      {/* Upload Progress */}
                      {fileObj.status === "uploading" && (
                        <span className="text-xs text-blue-600">
                          {Math.round(progress)}%
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {fileObj.status === "uploading" && showProgress && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}

                    {/* Error Messages */}
                    {hasError && (
                      <div className="mt-1">
                        {errors[fileObj.id].map((error, index) => (
                          <p key={index} className="text-xs text-red-600">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  {fileObj.status === "pending" && !hasError && (
                    <button
                      onClick={() => uploadFile(fileObj)}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      Upload
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global Errors */}
      {errors.limit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-700">{errors.limit[0]}</p>
          </div>
        </div>
      )}

      {/* Preview for images */}
      {showPreview && files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files
            .filter((f) => f.type.startsWith("image/"))
            .map((fileObj) => (
              <div key={`preview-${fileObj.id}`} className="relative group">
                <img
                  src={URL.createObjectURL(fileObj.file)}
                  alt={fileObj.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeFile(fileObj.id)}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

// Simple file upload button
export const SimpleFileUpload = ({
  onFileSelect,
  acceptedTypes = "*/*",
  children,
  className = "",
}) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(Array.from(e.target.files));
    }
    e.target.value = "";
  };

  return (
    <div className={className}>
      <button onClick={handleClick} className="w-full">
        {children}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

// Image upload with preview
export const ImageUpload = ({
  onImageSelect,
  maxImages = 5,
  className = "",
}) => {
  const [images, setImages] = useState([]);

  const handleFileSelect = (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const newImages = imageFiles
      .slice(0, maxImages - images.length)
      .map((file) => ({
        id: Date.now() + Math.random(),
        file,
        url: URL.createObjectURL(file),
      }));

    setImages((prev) => [...prev, ...newImages]);
    onImageSelect(newImages.map((img) => img.file));
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className={className}>
      <FileUpload
        onFileSelect={handleFileSelect}
        acceptedTypes="image/*"
        maxFiles={maxImages}
        showPreview={false}
      />

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt="Upload preview"
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
