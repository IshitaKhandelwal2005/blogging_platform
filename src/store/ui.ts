import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DraftPost {
  title: string;
  content: string;
  categoryIds: number[];
}

interface UIStore {
  // Selected category filter
  selectedCategoryId: number | null;
  setSelectedCategory: (id: number | null) => void;

  // Draft post autosave
  draftPost: DraftPost | null;
  setDraftPost: (draft: DraftPost | null) => void;
  updateDraft: (partial: Partial<DraftPost>) => void;

  // Loading states
  isSubmitting: boolean;
  setSubmitting: (state: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Category filter
      selectedCategoryId: null,
      setSelectedCategory: (id) => set({ selectedCategoryId: id }),

      // Draft post
      draftPost: null,
      setDraftPost: (draft) => set({ draftPost: draft }),
      updateDraft: (partial) =>
        set((state) => ({
          draftPost: state.draftPost
            ? { ...state.draftPost, ...partial }
            : null
        })),

      // Loading state
      isSubmitting: false,
      setSubmitting: (state) => set({ isSubmitting: state })
    }),
    {
      name: 'blog-ui-store'
    }
  )
);