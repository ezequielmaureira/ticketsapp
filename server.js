const cors = require("cors"); 
const express = require("express");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");

const app = express();
app.use(express.json());

const SECRET = "123456";
const tickets = {};

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.get("/ticket", async (req, res) => {
  const id = Math.random().toString(36).substring(7);

  const token = jwt.sign({ id }, SECRET);

  tickets[id] = { used: false };

  const qr = await QRCode.toDataURL(token);

  res.send(`<h2>QR</h2><img src="${qr}" />`);
});

app.post("/validate", (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, SECRET);

    if (!tickets[decoded.id]) return res.send("No existe");
    if (tickets[decoded.id].used) return res.send("Ya usado");

    tickets[decoded.id].used = true;

    res.send("OK");
  } catch {
    res.send("Inválido");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("RUNNING 🚀"));
