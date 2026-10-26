
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppUser } from "../types/auth";

interface UserState {
  userData: AppUser | null;
}

const initialState: UserState = {
  userData: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (
      state,
      action: PayloadAction<AppUser | null>
    ) => {
      state.userData = action.payload;
    },

    clearUser: (state) => {
      state.userData = null;
    },
  },
});

export const { setUserData, clearUser } = userSlice.actions;

export default userSlice.reducer;
