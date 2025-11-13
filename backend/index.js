require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const { sequelize } = require("./models");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payments");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ===============================
//  SERVIR FRONTEND ESTÁTICO
// ===============================

// Servir todo lo que está en backend/public (donde el UserData copia el frontend)
app.use(express.static(path.join(__dirname, "public")));

// Ruta raíz: mostrar login.html como primera pantalla
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// (opcional) Ruta /login explícita
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ===============================
//  RUTAS DE API
// ===============================

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

// Endpoint de prueba POST
app.post("/test", (req, res) => {
  res.json({ message: "POST recibido correctamente" });
});


//LOAD BALANCER HEALTH ENDPOINT quitar esto


// Endpoint de salud para el Load Balancer
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ===============================
//  INICIO DEL SERVIDOR
// ===============================

const PORT = process.env.PORT || 3000;

sequelize
  .sync()
  .then(() => {
    console.log("✅ DB sincronizada");
    app.listen(PORT, () => {
      console.log(`🚀 Server en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error sincronizando DB:", err);
  });
