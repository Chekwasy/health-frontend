import { configureStore } from "@reduxjs/toolkit";
import combinedReducers from "./combinedReducers";

const store = configureStore({
    reducer: combinedReducers,
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;