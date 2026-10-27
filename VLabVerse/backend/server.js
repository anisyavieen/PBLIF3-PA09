require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Backend VLabVerse berhasil berjalan!",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DATABASE() AS database_name"
    );

    res.json({
      message: "Koneksi MySQL berhasil!",
      database: rows[0].database_name,
    });
  } catch (error) {
    console.error("Koneksi database gagal:", error.message);

    res.status(500).json({
      message: "Koneksi database gagal.",
    });
  }
});

app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});