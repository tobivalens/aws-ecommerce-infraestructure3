// backend/seed.js
require("dotenv").config();
const { sequelize } = require("./models");
const Product = require("./models/product");

// 🛒 Productos de ejemplo (puedes seguir agregando aquí)
const productos = [
  {
    nombre: "El Principito",
    descripcion: "Clásico de Antoine de Saint-Exupéry",
    precio: 35000,
    imagen: "img/principito.jpeg",
  },
  {
    nombre: "Cien años de soledad",
    descripcion: "Gabriel García Márquez",
    precio: 58000,
    imagen: "img/cienañosdesoledad.jpg",
  },
  {
    nombre: "Don Quijote de la Mancha",
    descripcion: "Miguel de Cervantes",
    precio: 42000,
    imagen: "img/donquijote.jpg",
  },
  {
    nombre: "Rayuela",
    descripcion: "Julio Cortázar",
    precio: 39000,
    imagen: "img/rayuela_JC.png",
  },
  // 👉 aquí puedes ir agregando más productos:
  // { nombre: "...", descripcion: "...", precio: 12345, imagen: "img/loquesea.jpg" },
];

async function seedProducts() {
  try {
    console.log("🌱 Aplicando seed de productos...");

    for (const p of productos) {
      // ⚠️ IMPORTANTE: esto evita duplicados si vuelves a correr el seed
      await Product.findOrCreate({
        where: { nombre: p.nombre },
        defaults: p,
      });
    }

    console.log("✅ Seed de productos aplicado (sin borrar datos).");
  } catch (e) {
    console.error("❌ Error en seedProducts:", e);
    throw e;
  }
}

/**
 * Modo CLI:
 * - Si ejecutas: `node seed.js`
 *   se conecta a la BD, hace sync() (sin borrar) y aplica el seed.
 */
if (require.main === module) {
  (async () => {
    try {
      await sequelize.sync(); // SIN { force: true }
      await seedProducts();
      process.exit(0);
    } catch (err) {
      console.error("❌ Error ejecutando seed via CLI:", err);
      process.exit(1);
    }
  })();
}

module.exports = { seedProducts, productos };
