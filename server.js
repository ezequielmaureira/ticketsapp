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

// 🔐 LOGIN ADMIN (simple)
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// 🟢 CONEXIÓN POSTGRES (RAILWAY)
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
app.post("/login", (req, res) => {
  const { user, pass } = req.body;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    const token = jwt.sign({ role: "admin" }, SECRET, { expiresIn: "2h" });
    return res.json({ token });
  }

  res.status(401).json({ error: "Credenciales incorrectas" });
});

// =======================
// 🔒 MIDDLEWARE AUTH
// =======================
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("No autorizado");

  try {
    jwt.verify(token, SECRET);
    next();
  } catch (err) {
    return res.status(401).send("Token inválido");
  }
}

// =======================
// 🎟️ GENERAR TICKET
// =======================
app.get("/ticket", async (req, res) => {
  const id = Math.random().toString(36).substring(7);

  const token = jwt.sign({ id }, SECRET);

  const qr = await QRCode.toDataURL(token);

  res.send(`
    <h2>QR 🎟️</h2>
    <img src="${qr}" />
    <p>${token}</p>
  `);
});

// =======================
// 🔐 VALIDAR TICKET
// =======================
app.post("/validate", (req, res) => {
  try {
    const { token } = req.body;
    jwt.verify(token, SECRET);
    res.send("OK ✅");
  } catch (e) {
    res.send("Inválido ❌");
  }
});

app.get("/validate", (req, res) => {
  try {
    const token = req.query.token;
    jwt.verify(token, SECRET);
    res.send("OK ✅");
  } catch (e) {
    res.send("Inválido ❌");
  }
});

// =======================
// 🎫 EVENTS (POSTGRES)
// =======================

// ➕ CREAR EVENTO (AHORA PROTEGIDO)
app.post("/events", auth, async (req, res) => {
  try {
    const { name, date, price } = req.body;

    await pool.query(
      "INSERT INTO events (name, date, price) VALUES ($1, $2, $3)",
      [name, date, price]
    );

    res.json({ ok: true });

  } catch (err) {
    console.error("ERROR POST /events:", err);
    res.status(500).json({ ok: false });
  }
});

// 📥 OBTENER EVENTOS (PÚBLICO)
app.get("/events", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (err) {
    console.error("ERROR GET /events:", err);
    res.status(500).json([]);
  }
});

// =======================
// 🚀 SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("RUNNING 🚀 on port " + PORT);
});
