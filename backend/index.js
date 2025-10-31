require('dotenv').config();const express = require('express');

const cors = require('cors');
const app = express();
app.use(cors());
const { sequelize } = require('./models');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users'); // 👈


app.use(express.json());

console.log("✅ Rutas cargadas:", { productRoutes: !!productRoutes, userRoutes: !!userRoutes }); // 👈 agrega esto

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Raíz
app.get('/', (req, res) => res.send('📚 Librería backend funcionando'));

// Start
const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  console.log('✅ DB sincronizada');
  app.listen(PORT, () => console.log(`🚀 Server en http://localhost:${PORT}`));
}).catch(err => {
  console.error('Error sincronizando DB:', err);
});
app.post('/test', (req, res) => {
  res.json({ message: 'POST recibido correctamente' });
});
