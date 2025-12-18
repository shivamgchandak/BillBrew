const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

const authRoutes = require("./routes/authRoutes");
const statementRoutes = require("./routes/statementRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/statements", statementRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});