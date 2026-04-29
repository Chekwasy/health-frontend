import { createSlice } from "@reduxjs/toolkit";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  title: string | null;
  phone: string | null;
  role: "PATIENT" | "DOCTOR" | "ADMIN" | "";
  created_at: string;
}

interface StoreState {
  logged: boolean;
  isInitialized: boolean;
  profileComplete: boolean; // 🔥 NEW
  me: UserProfile;
}

const initialState: StoreState = {
  logged: false,
  isInitialized: false,
  profileComplete: false, // 🔥 default false
  me: {
    id: "",
    email: "",
    first_name: "",
    last_name: "",
    title: null,
    phone: null,
    role: "",
    created_at: "",
  },
};

const mainSlice = createSlice({
  name: "mainState",
  initialState,
  reducers: {
    // 🔥 Set user + profile completeness
    setUser: (state, action) => {
      state.me = action.payload.me;
      state.profileComplete = action.payload.profileComplete; // 🔥 IMPORTANT
      state.logged = true;
      state.isInitialized = true;
    },

    // 🔥 When no user / token invalid
    setInitialized: (state) => {
      state.isInitialized = true;
    },

    // 🔥 Logout
    logout: (state) => {
      state.logged = false;
      state.profileComplete = false; // 🔥 reset
      state.me = initialState.me;
      state.isInitialized = true;
    },
  },
});

export const { setUser, logout, setInitialized } = mainSlice.actions;
export default mainSlice.reducer;