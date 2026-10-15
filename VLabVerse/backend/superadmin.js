const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcryptjs");
const pool = require("./db");
const readline = require("readline/promises");
const { stdin, stdout } = require("process");

async function buatSuperAdmin() {
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  try {
    const nama = await rl.question("Nama Super Admin: ");
    const email = await rl.question("Email Super Admin: ");
    const password = await rl.question("Password Super Admin: ");

    if (!nama.trim() || !email.trim() || !password) {
      throw new Error("Semua data wajib diisi.");
    }

    if (password.length < 12) {
      throw new Error("Password minimal 12 karakter.");
    }

    const [akun] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email.trim()]
    );

    if (akun.length > 0) {
      throw new Error("Email sudah terdaftar.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.execute(
      `INSERT INTO users (nama, email, password, role)
       VALUES (?, ?, ?, 'super_admin')`,
      [nama.trim(), email.trim(), passwordHash]
    );

    console.log("Akun Super Admin berhasil dibuat!");
  } catch (error) {
    console.error("Gagal membuat akun:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await pool.end();
  }
}

buatSuperAdmin();