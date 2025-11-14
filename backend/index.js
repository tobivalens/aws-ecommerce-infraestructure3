// backend/index.js
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const { sequelize } = require("./models");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payments");
const { seedProducts } = require("./seed"); // 👈 importamos el seed

const app = express();

app.use(cors());
app.use(express.json());

// STATIC: servir frontend desde /public (ya con index/login/etc)
app.use(
  express.static(path.join(__dirname, "public"), {
    index: false,
  })
);

// Rutas de front
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rutas API
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

// Healthcheck
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;

// Arranque del servidor + seed automático
sequelize
  .sync() // SIN force:true
  .then(async () => {
    console.log("✅ DB sincronizada");
    await seedProducts(); // 👈 aquí se aplica el seed en cada arranque
    app.listen(PORT, () => {
      console.log(`🚀 Server escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error sincronizando DB:", err);
  });
