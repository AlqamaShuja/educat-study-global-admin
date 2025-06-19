// stores/officeStore.js

import { create } from "zustand";
import officeService from "../services/officeService";

const useOfficeStore = create((set) => ({
  offices: [],
  loading: false,

  fetchOffices: async () => {
    set({ loading: true });
    try {
      const data = await officeService.getAllOffices();
      console.log(data, "asknacnascjasncasn");
      
      set({ offices: data });
    } finally {
      set({ loading: false });
    }
  },

  createOffice: async (data) => {
    const newOffice = await officeService.createOffice(data);
    set((state) => ({
      offices: [...state.offices, newOffice],
    }));
    return newOffice;
  },

  updateOffice: async (id, data) => {
    const updated = await officeService.updateOffice(id, data);
    set((state) => ({
      offices: state.offices.map((office) =>
        office.id === id ? updated : office
      ),
    }));
    return updated;
  },

  toggleOfficeStatus: async (id, isActive) => {
    const updated = await officeService.toggleOfficeStatus(id, isActive);
    set((state) => ({
      offices: state.offices.map((office) =>
        office.id === id ? updated : office
      ),
    }));
    return updated;
  },
}));

export default useOfficeStore;
