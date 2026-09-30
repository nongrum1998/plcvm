// stores/pdf-preview.ts
import { create } from 'zustand';

type PdfPreviewState = {
  uri: string | null;
  downloadable: boolean;
  setPdf: (uri: string, downloadable?: boolean) => void;
  clearPdf: () => void;
};

export const usePdfPreviewStore = create<PdfPreviewState>((set) => ({
  uri: null,
  downloadable: true,

  setPdf: (uri, downloadable = true) =>
    set({
      uri,
      downloadable,
    }),

  clearPdf: () =>
    set({
      uri: null,
      downloadable: true,
    }),
}));
