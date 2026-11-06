const jwt = require("jsonwebtoken");
const pool = require("./db");

// Memeriksa token dan status akun terbaru di database
async function autentikasi(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token tidak ditemukan. Silakan login kembali.",
    });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ambil status dan role terbaru dari database
    const [users] = await pool.execute(
      `SELECT id, nama, email, role, status
       FROM users
       WHERE id = ?`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Akun tidak ditemukan. Silakan login kembali.",
      });
    }

    const user = users[0];

    if (user.status !== "aktif") {
      return res.status(403).json({
        message: "Akun Anda sudah dinonaktifkan. Silakan hubungi Super Admin.",
        code: "ACCOUNT_INACTIVE",
      });
    }

    // Gunakan role dari database, bukan hanya dari token
    req.user = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token tidak valid atau sudah kedaluwarsa. Silakan login kembali.",
      });
    }

    console.error("Autentikasi gagal:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan saat memeriksa akun.",
    });
  }
}

// Hanya Super Admin yang boleh mengelola akun Admin
function khususSuperAdmin(req, res, next) {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      message: "Akses hanya untuk Super Admin.",
    });
  }

  next();
}

// Hanya Admin yang boleh mengelola konten landing page
function khususAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Akses hanya untuk Admin.",
    });
  }

  next();
}

module.exports = {
  autentikasi,
  khususSuperAdmin,
  khususAdmin,
};