require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const noticeRoutes = require("./routes/noticeRoutes");

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Digital Notice Board API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map(e => e.message).join(", ")
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID"
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
