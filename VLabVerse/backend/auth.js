
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const router = express.Router();

// Middleware untuk memeriksa token login
function autentikasi(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token tidak ditemukan. Silakan login kembali.",
    });
  }

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid atau sudah kedaluwarsa.",
    });
  }
}

// Middleware khusus super admin
function khususSuperAdmin(req, res, next) {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      message: "Akses hanya untuk Super Admin.",
    });
  }

  next();
}

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi.",
      });
    }

    const [users] = await pool.execute(
      `SELECT id, nama, email, password, role
       FROM users WHERE email = ?`,
      [email.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Email atau password salah.",
      });
    }

    const user = users[0];
    const cocok = await bcrypt.compare(password, user.password);

    if (!cocok) {
      return res.status(401).json({
        message: "Email atau password salah.",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login berhasil.",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login gagal:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
});

// DAFTAR AKUN ADMIN
router.get(
  "/admins",
  autentikasi,
  khususSuperAdmin,
  async (req, res) => {
    try {
      const [admins] = await pool.execute(
        `SELECT id, nama, email, role
         FROM users
         WHERE role = 'admin'
         ORDER BY id DESC`
      );

      res.json(admins);
    } catch (error) {
      console.error("Gagal mengambil admin:", error);
      res.status(500).json({
        message: "Gagal mengambil data admin.",
      });
    }
  }
);

// TAMBAH AKUN ADMIN
router.post(
  "/admins",
  autentikasi,
  khususSuperAdmin,
  async (req, res) => {
    try {
      const { nama, email, password, status } = req.body;

      if (!nama?.trim() || !email?.trim() || !password) {
        return res.status(400).json({
          message: "Nama, email, dan password wajib diisi.",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: "Password minimal 8 karakter.",
        });
      }

      const [existing] = await pool.execute(
        "SELECT id FROM users WHERE email = ?",
        [email.trim()]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          message: "Email sudah terdaftar.",
        });
      }

      const hash = await bcrypt.hash(password, 12);

      const [result] = await pool.execute(
        `INSERT INTO users (nama, email, password, role)
         VALUES (?, ?, ?, 'admin')`,
        [nama.trim(), email.trim(), hash]
      );

      res.status(201).json({
        message: "Akun admin berhasil ditambahkan.",
        id: result.insertId,
      });
    } catch (error) {
      console.error("Gagal menambahkan admin:", error);
      res.status(500).json({
        message: "Gagal menambahkan akun admin.",
      });
    }
  }
);

// EDIT AKUN ADMIN
router.put(
  "/admins/:id",
  autentikasi,
  khususSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nama, email, password } = req.body;

      if (!nama?.trim() || !email?.trim()) {
        return res.status(400).json({
          message: "Nama dan email wajib diisi.",
        });
      }

      const [admins] = await pool.execute(
        "SELECT id FROM users WHERE id = ? AND role = 'admin'",
        [id]
      );

      if (admins.length === 0) {
        return res.status(404).json({
          message: "Akun admin tidak ditemukan.",
        });
      }

      const [existing] = await pool.execute(
        "SELECT id FROM users WHERE email = ? AND id <> ?",
        [email.trim(), id]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          message: "Email sudah digunakan akun lain.",
        });
      }

      if (password) {
        if (password.length < 8) {
          return res.status(400).json({
            message: "Password minimal 8 karakter.",
          });
        }

        const hash = await bcrypt.hash(password, 12);

        await pool.execute(
          `UPDATE users
           SET nama = ?, email = ?, password = ?
           WHERE id = ? AND role = 'admin'`,
          [nama.trim(), email.trim(), hash, id]
        );
      } else {
        await pool.execute(
          `UPDATE users
           SET nama = ?, email = ?
           WHERE id = ? AND role = 'admin'`,
          [nama.trim(), email.trim(), id]
        );
      }

      res.json({
        message: "Akun admin berhasil diperbarui.",
      });
    } catch (error) {
      console.error("Gagal mengedit admin:", error);
      res.status(500).json({
        message: "Gagal memperbarui akun admin.",
      });
    }
  }
);

// HAPUS AKUN ADMIN
router.delete(
  "/admins/:id",
  autentikasi,
  khususSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        "DELETE FROM users WHERE id = ? AND role = 'admin'",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Akun admin tidak ditemukan.",
        });
      }

      res.json({
        message: "Akun admin berhasil dihapus.",
      });
    } catch (error) {
      console.error("Gagal menghapus admin:", error);
      res.status(500).json({
        message: "Gagal menghapus akun admin.",
      });
    }
  }
);

module.exports = router;
