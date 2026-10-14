const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi.",
      });
    }

    const [users] = await pool.execute(
      "SELECT id, nama, email, password, role FROM users WHERE email = ?",
      [email.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Email atau password salah.",
      });
    }

    const user = users[0];
    const passwordCocok = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCocok) {
      return res.status(401).json({
        message: "Email atau password salah.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
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
    console.error("Login gagal:", error.message);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
});

module.exports = router;