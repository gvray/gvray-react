import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type DictMap = Record<string, API.DictionaryItemResponseDto[]>;

interface DictState {
  cache: DictMap;
  loading: string[];
  setDict: (code: string, items: API.DictionaryItemResponseDto[]) => void;
  getDict: (code: string) => API.DictionaryItemResponseDto[] | undefined;
  isLoading: (code: string) => boolean;
  markLoading: (code: string) => void;
}

export const useDictStore = create<DictState>()(
  immer((set, get) => ({
    cache: {},
    loading: [],

    setDict: (code, items) =>
      set((s) => {
        s.cache[code] = items;
        s.loading = s.loading.filter((c) => c !== code);
      }),

    getDict: (code) => get().cache[code],

    isLoading: (code) => get().loading.includes(code),

    markLoading: (code) =>
      set((s) => {
        if (!s.loading.includes(code)) {
          s.loading.push(code);
        }
      }),
  })),
);
