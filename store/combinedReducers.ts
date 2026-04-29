// store/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import mainSlice from "./slices/mainslice";

const combinedReducers = combineReducers({
  mainState: mainSlice,
});

export default combinedReducers;