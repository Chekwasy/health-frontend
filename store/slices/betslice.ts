import { createSlice } from "@reduxjs/toolkit";

const bet: {betTab: string} = {
    betTab: 'open',
} 

const betSlice = createSlice({
    name: "betState",
    initialState: bet,
    reducers: {
        betStateReducer: (state, action) => {
            state.betTab = action.payload.betTab;
        }
    }
});

export const { betStateReducer } = betSlice.actions;
export default betSlice.reducer;
