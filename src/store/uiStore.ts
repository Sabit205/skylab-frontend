import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ColorScheme = 'light' | 'dark';

interface UIState {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
}

// Using persist middleware to save the theme preference in localStorage
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      colorScheme: 'light', // Default theme
      toggleColorScheme: () =>
        set((state) => ({
          colorScheme: state.colorScheme === 'dark' ? 'light' : 'dark',
        })),
    }),
    {
      name: 'ui-store', // name of the item in storage
    }
  )
);