import { useState } from "react";
import * as documentService from "../services/documentService";

const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file, config = {}) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await documentService.uploadDocument(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
        ...config,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "File upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleFiles = async (files, config = {}) => {
    const results = [];
    setUploading(true);
    setError(null);
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadFile(files[i], config);
        results.push(result);
        setProgress(((i + 1) / files.length) * 100);
      } catch (err) {
        setError(
          err.response?.data?.error || `Failed to upload file: ${files[i].name}`
        );
        results.push({ error: err });
      }
    }

    setUploading(false);
    return results;
  };

  return {
    uploading,
    error,
    progress,
    uploadFile,
    uploadMultipleFiles,
  };
};

export default useFileUpload;
