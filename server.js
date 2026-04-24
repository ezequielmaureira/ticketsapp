const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const { Pool } = require("pg");

const app = express();

app.use(express.json());
app.use(cors());

// 🔐 SECRET
const SECRET = "abc123456";

// 🟢 CONEXIÓN POSTGRES
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// =======================
// 🧠 RUTA BASE
// =======================
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// =======================
// 🔐 LOGIN
// =======================
app.post("/login", async (req, res) => {
  const { user, pass } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [user]
    );

    const dbUser = result.rows[0];

    if (!dbUser || dbUser.password !== pass) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // 🔥 AQUÍ ESTÁ LA MEJORA CLAVE
    const token = jwt.sign(
      {
        id: dbUser.id,
        role: dbUser.role,
        username: dbUser.username
      },
      SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Error servidor" });
  }
});

// =======================
// 🔒 AUTH GENERAL
// =======================
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("No autorizado");

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.role !== "admin" && decoded.role !== "seller") {
      return res.status(403).send("Sin permisos");
    }

    req.user = decoded;
    next();

  } catch {
    return res.status(401).send("Token inválido");
  }
}

// =======================
// 🔒 SOLO ADMIN
// =======================
function onlyAdmin(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("No autorizado");

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).send("Solo admin");
    }

    req.user = decoded;
    next();

  } catch {
    return res.status(401).send("Token inválido");
  }
}

// =======================
// 👤 CREAR USUARIO (ADMIN)
// =======================
app.post("/users", onlyAdmin, async (req, res) => {
  try {
    const { username, role } = req.body;

    const password = Math.random().toString(36).slice(-8) + "A1!";

    await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
      [username, password, role]
    );

    res.json({ ok: true, password });

  } catch (err) {
    console.error("ERROR POST /users:", err);
    res.status(500).json({ ok: false });
  }
});

// =======================
// 📋 LISTAR USUARIOS
// =======================
app.get("/users", onlyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, role FROM users ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (err) {
    console.error("ERROR GET /users:", err);
    res.status(500).json([]);
  }
});

// =======================
// ❌ ELIMINAR USUARIO
// =======================
app.delete("/users/:id", onlyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [id]
    );

    const user = result.rows[0];

    if (!user) return res.status(404).send("No existe");

    if (user.role === "admin") {
      return res.status(400).send("No se puede eliminar admin");
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    res.json({ ok: true });

  } catch (err) {
    console.error("ERROR DELETE /users:", err);
    res.status(500).json({ ok: false });
  }
});

// =======================
// 🎟️ TICKET
// =======================
app.get("/ticket", async (req, res) => {
  const id = Math.random().toString(36).substring(7);
  const token = jwt.sign({ id }, SECRET);
  const qr = await QRCode.toDataURL(token);

  res.send(`<h2>QR 🎟️</h2><img src="${qr}" /><p>${token}</p>`);
});

// =======================
// 🔐 VALIDAR
// =======================
app.post("/validate", (req, res) => {
  try {
    jwt.verify(req.body.token, SECRET);
    res.send("OK ✅");
  } catch {
    res.send("Inválido ❌");
  }
});

// =======================
// 🎫 EVENTS
// =======================
app.post("/events", auth, async (req, res) => {
  try {
    const { name, date, price } = req.body;

    await pool.query(
      "INSERT INTO events (name, date, price) VALUES ($1, $2, $3)",
      [name, date, price]
    );

    res.json({ ok: true });

  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

app.get("/events", async (req, res) => {
  const result = await pool.query("SELECT * FROM events ORDER BY id DESC");
  res.json(result.rows);
});

// =======================
// 🚀 SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("RUNNING 🚀 on port " + PORT);
});
