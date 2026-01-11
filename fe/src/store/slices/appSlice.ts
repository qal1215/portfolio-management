import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';
type Layout = 'main' | 'admin';

type AppState = {
  theme: Theme;
  layout: Layout;
};

const initialState: AppState = {
  theme: 'light',
  layout: 'main',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setLayout(state, action: PayloadAction<Layout>) {
      state.layout = action.payload;
    },
  },
});

export const { setTheme, toggleTheme, setLayout } = appSlice.actions;
export default appSlice.reducer;
