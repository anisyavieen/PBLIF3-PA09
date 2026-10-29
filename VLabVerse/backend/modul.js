
const express = require("express");
const router = express.Router();
const pool = require("./db");


router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM lab_modules ORDER BY id DESC"
    );

    const modules = rows.map((item) => ({
      id: item.id,
      nama: item.title,
      deskripsi: item.description,
      status: item.status,
      image_url: item.image_url,
      jumlah_parameter: 0,
      jumlah_grup: 0,
    }));

    res.json(modules);
  } catch (error) {
    console.error("Gagal mengambil modul:", error.message);

    res.status(500).json({
      message: "Gagal mengambil data modul.",
    });
  }
});


router.post("/", async (req, res) => {
  try {
    const { nama, deskripsi, status, image_url } = req.body;

    if (!nama || !deskripsi) {
      return res.status(400).json({
        message: "Nama dan deskripsi modul wajib diisi.",
      });
    }

    const statusModul =
      status === "nonaktif" ? "nonaktif" : "aktif";

    const [result] = await pool.query(
      `INSERT INTO lab_modules
       (title, description, status, image_url)
       VALUES (?, ?, ?, ?)`,
      [nama, deskripsi, statusModul, image_url || null]
    );

    res.status(201).json({
      message: "Modul berhasil ditambahkan.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Gagal menambahkan modul:", error.message);

    res.status(500).json({
      message: "Gagal menambahkan modul.",
    });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { nama, deskripsi, status, image_url } = req.body;
    const { id } = req.params;

    if (!nama || !deskripsi) {
      return res.status(400).json({
        message: "Nama dan deskripsi modul wajib diisi.",
      });
    }

    const statusModul =
      status === "nonaktif" ? "nonaktif" : "aktif";

    const [result] = await pool.query(
      `UPDATE lab_modules
       SET title = ?,
           description = ?,
           status = ?,
           image_url = ?
       WHERE id = ?`,
      [nama, deskripsi, statusModul, image_url || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Modul tidak ditemukan.",
      });
    }

    res.json({
      message: "Modul berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal mengedit modul:", error.message);

    res.status(500).json({
      message: "Gagal mengedit modul.",
    });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM lab_modules WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Modul tidak ditemukan.",
      });
    }

    res.json({
      message: "Modul berhasil dihapus.",
    });
  } catch (error) {
    console.error("Gagal menghapus modul:", error.message);

    res.status(500).json({
      message: "Gagal menghapus modul.",
    });
  }
});

module.exports = router;
