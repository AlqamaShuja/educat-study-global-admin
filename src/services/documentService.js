// services/documentService.js

import api from "./api";

const documentService = {
  uploadReviewDocuments: async (formData) => {
    const res = await api.post("/student/reviews/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  getDocumentStatus: async () => {
    const res = await api.get("/student/documents/status");
    return res.data;
  },
};

export default documentService;
