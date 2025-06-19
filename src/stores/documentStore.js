// stores/documentStore.js

import { create } from "zustand";
import documentService from "../services/documentService";

const useDocumentStore = create((set) => ({
  documents: [],
  loading: false,

  fetchDocumentStatus: async () => {
    set({ loading: true });
    try {
      const data = await documentService.getDocumentStatus();
      set({ documents: data });
    } finally {
      set({ loading: false });
    }
  },

  uploadDocuments: async (formData) => {
    const uploaded = await documentService.uploadReviewDocuments(formData);
    set((state) => ({
      documents: [...state.documents, ...uploaded],
    }));
    return uploaded;
  },
}));

export default useDocumentStore;
