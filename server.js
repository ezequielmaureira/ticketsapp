const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");

const app = express();

app.use(express.json());
app.use(cors());

const SECRET = "abc123456"; // CAMBIAMOS SECRET (importante)

// raíz
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// generar ticket
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

// validar ticket (UN SOLO ENDPOINT)
app.post("/validate", (req, res) => {
  try {
    const { token } = req.body;

    console.log("TOKEN RECIBIDO:", token);

    const decoded = jwt.verify(token, SECRET);

    console.log("DECODED:", decoded);

    res.send("OK ✅");
  } catch (e) {
    console.log("ERROR:", e.message);
    res.send("Inválido ❌");
  }
});

app.get("/validate", (req, res) => {
  try {
    const token = req.query.token;

    const decoded = jwt.verify(token, SECRET);

    res.send("OK ✅");
  } catch (e) {
    res.send("Inválido ❌");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("RUNNING 🚀"));
