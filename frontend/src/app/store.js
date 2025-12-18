import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import statementsReducer from "../features/statements/statementsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    statements: statementsReducer,
  },
});