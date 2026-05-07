import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Language } from '../constants/i18n';

const STORAGE_KEY = 'app_language';

interface LanguageState {
  language: Language;
  initialized: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  initialize:  () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language:    'en',
  initialized: false,

  setLanguage: async (lang) => {
    set({ language: lang });
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  },

  initialize: async () => {
    if (get().initialized) return;
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'th') {
        set({ language: saved, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch {
      set({ initialized: true });
    }
  },
}));
