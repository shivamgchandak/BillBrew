import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchStatements,
  fetchStatementById,
  deleteStatement,
} from "../../api";

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

export const removeStatement = createAsyncThunk(
  "statements/remove",
  async (id) => {
    await deleteStatement(id);
    return id;
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
      .addCase(getStatements.pending, (s) => { s.loading = true; })
      .addCase(getStatements.fulfilled, (s, a) => {
        s.list = a.payload;
        s.loading = false;
      })
      .addCase(getStatements.rejected, (s) => { s.loading = false; })
      .addCase(getStatement.fulfilled, (s, a) => { s.selected = a.payload; })
      .addCase(removeStatement.fulfilled, (s, a) => {
        s.list = s.list.filter((x) => x._id !== a.payload);
        if (s.selected?._id === a.payload) s.selected = null;
      });
  },
});

export default statementsSlice.reducer;
