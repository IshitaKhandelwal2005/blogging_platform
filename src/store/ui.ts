import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DraftPost {
  title: string;
  content: string;
  categoryIds: number[];
}

interface UIStore {
  selectedCategoryId: number | null;
  setSelectedCategory: (id: number | null) => void;

  draftPost: DraftPost | null;
  setDraftPost: (draft: DraftPost | null) => void;
  updateDraft: (partial: Partial<DraftPost>) => void;

  isSubmitting: boolean;
  setSubmitting: (state: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      selectedCategoryId: null,
      setSelectedCategory: (id) => set({ selectedCategoryId: id }),

      draftPost: null,
      setDraftPost: (draft) => set({ draftPost: draft }),
      updateDraft: (partial) =>
        set((state) => ({
          draftPost: state.draftPost
            ? { ...state.draftPost, ...partial }
            : null
        })),

      isSubmitting: false,
      setSubmitting: (state) => set({ isSubmitting: state })
    }),
    {
      name: 'blog-ui-store'
    }
  )
);