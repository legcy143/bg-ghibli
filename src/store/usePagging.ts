import { create } from 'zustand';

interface PaggingStore {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  resetPage: () => void;
  canNavigateNext: () => boolean;
  canNavigatePrevious: () => boolean;
}

export const usePaggingStore = create<PaggingStore>((set, get) => ({
  currentPage: 0,
  totalPages: 4, 
  setCurrentPage: (page) => {
    const { totalPages } = get();
    if (page >= 0 && page < totalPages) {
      set({ currentPage: page });
    }
  },
  nextPage: () =>
    set((state) => {
      const nextPage = state.currentPage + 1;
      const newPage =
        nextPage < state.totalPages ? nextPage : state.currentPage;
      console.log(
        `🔄 Paging: Moving from page ${state.currentPage} to page ${newPage}`,
      );
      return {
        currentPage: newPage,
      };
    }),
  previousPage: () =>
    set((state) => ({ currentPage: Math.max(0, state.currentPage - 1) })),
  resetPage: () => set({ currentPage: 0 }),
  canNavigateNext: () => {
    const { currentPage, totalPages } = get();
    return currentPage < totalPages - 1;
  },
  canNavigatePrevious: () => {
    const { currentPage } = get();
    return currentPage > 0;
  },

}));
