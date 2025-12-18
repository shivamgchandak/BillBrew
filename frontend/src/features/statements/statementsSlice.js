import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedStatement: {
    issuer: "HDFC Bank",
    holderName: "Shivam Chandak",
    cardIdentifier: "XX57",
    billingCycle: "18-10-2025",
    dueDate: "07 Dec 2025",
    totalAmount: 1831,
    minimumAmount: 218,
    transactions: [
      { id: 1, name: "Amazon", amount: 1200 },
      { id: 2, name: "Uber", amount: 450 },
      { id: 3, name: "Swiggy", amount: 320 },
      { id: 4, name: "Netflix", amount: 199 },
      { id: 5, name: "Fuel", amount: 900 },
    ],
  },
};

const statementsSlice = createSlice({
  name: "statements",
  initialState,
  reducers: {},
});

export default statementsSlice.reducer;