import { create } from "zustand";

const useUIStore = create((set) => ({
  isSidebarOpen: true,
  activeModal: null,
  theme: localStorage.getItem("theme") || "light",

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },

  openModal: (modalName) => set({ activeModal: modalName }),

  closeModal: () => set({ activeModal: null }),
}));

export default useUIStore;
