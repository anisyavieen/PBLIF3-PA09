require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./auth");
const modulRoutes = require("./modul");
const landingPageRoutes = require("./landingpage");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Tes backend
app.get("/", (req, res) => {
  res.json({
    message: "Backend VLabVerse berhasil berjalan!",
  });
});

// Tes koneksi database
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

// Route autentikasi
app.use("/api", authRoutes);

// Route CRUD modul lab
app.use("/api/modul", modulRoutes);
app.use("/api/landing-page", landingPageRoutes);

// Menangani endpoint yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
