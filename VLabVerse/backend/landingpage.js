
const express = require("express");
const router = express.Router();
const pool = require("./db");
const multer = require("multer");
const path = require("path");

// Konfigurasi penyimpanan foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const namaFile = Date.now() + path.extname(file.originalname);
    cb(null, namaFile);
  },
});

// Hanya menerima file gambar
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("File harus berupa gambar."));
    }
  },
});

// GET: Menampilkan semua konten landing page
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM landing_page_contents ORDER BY id ASC"
    );

    res.json(rows);
  } catch (error) {
    console.error("Gagal mengambil konten landing page:", error.message);
    res.status(500).json({
      message: "Gagal mengambil konten landing page.",
    });
  }
});

// POST: Menambahkan konten landing page
router.post("/", async (req, res) => {
  try {
    const {
      section_key,
      title,
      description,
      image_url,
      button_text,
      button_link,
    } = req.body;

    if (!section_key || !title) {
      return res.status(400).json({
        message: "section_key dan title wajib diisi.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO landing_page_contents
       (section_key, title, description, image_url, button_text, button_link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        section_key,
        title,
        description || null,
        image_url || null,
        button_text || null,
        button_link || null,
      ]
    );

    res.status(201).json({
      message: "Konten landing page berhasil ditambahkan.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Gagal menambahkan konten:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "section_key sudah digunakan. Gunakan key yang berbeda.",
      });
    }

    res.status(500).json({
      message: "Gagal menambahkan konten landing page.",
    });
  }
});

// PUT: Mengedit konten berdasarkan ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      section_key,
      title,
      description,
      image_url,
      button_text,
      button_link,
    } = req.body;

    if (!section_key || !title) {
      return res.status(400).json({
        message: "section_key dan title wajib diisi.",
      });
    }

    const [result] = await pool.query(
      `UPDATE landing_page_contents
       SET section_key = ?,
           title = ?,
           description = ?,
           image_url = ?,
           button_text = ?,
           button_link = ?
       WHERE id = ?`,
      [
        section_key,
        title,
        description || null,
        image_url || null,
        button_text || null,
        button_link || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Konten landing page tidak ditemukan.",
      });
    }

    res.json({
      message: "Konten landing page berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal memperbarui konten:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "section_key sudah digunakan oleh konten lain.",
      });
    }

    res.status(500).json({
      message: "Gagal memperbarui konten landing page.",
    });
  }
});

// DELETE: Menghapus konten berdasarkan ID
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM landing_page_contents WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Konten landing page tidak ditemukan.",
      });
    }

    res.json({
      message: "Konten landing page berhasil dihapus.",
    });
  } catch (error) {
    console.error("Gagal menghapus konten:", error.message);
    res.status(500).json({
      message: "Gagal menghapus konten landing page.",
    });
  }
});

// POST: Upload foto Hero
router.post("/upload", (req, res) => {
  upload.single("gambar")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || "Gagal mengunggah foto.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Pilih foto terlebih dahulu.",
      });
    }

    res.json({
      message: "Foto berhasil diunggah.",
      image_url: `/uploads/${req.file.filename}`,
    });
  });
});

module.exports = router;
