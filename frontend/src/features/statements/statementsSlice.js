import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchStatements, fetchStatementById } from "../../api";

export const getStatements = createAsyncThunk(
  "statements/getAll",
  async () => {
    const { data } = await fetchStatements();
    return data;
  }
);

export const getStatement = createAsyncThunk(
  "statements/getOne",
  async (id) => {
    const { data } = await fetchStatementById(id);
    return data;
  }
);

const statementsSlice = createSlice({
  name: "statements",
  initialState: {
    list: [],
    selected: null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStatements.pending, (s) => {
        s.loading = true;
      })
      .addCase(getStatements.fulfilled, (s, a) => {
        s.list = a.payload;
        s.loading = false;
      })
      .addCase(getStatement.fulfilled, (s, a) => {
        s.selected = a.payload;
      });
  },
});

export default statementsSlice.reducer;