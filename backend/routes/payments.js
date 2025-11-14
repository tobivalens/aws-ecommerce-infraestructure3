// routes/payments.js
const express = require('express');
const router = express.Router();
require('dotenv').config();

const { MercadoPagoConfig, Preference } = require('mercadopago');

// 🟢 Inicializar el SDK con el access token del .env
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

router.post('/', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No se enviaron productos.' });
    }

    // 🌐 URL base del frontend:
    // - En local será algo como: http://localhost:3000
    // - En AWS será: http://<DNS-ALB>
    const FRONTEND_URL =
      process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

    const preferenceData = {
      items: items.map((item) => ({
        title: item.title,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price),
        currency_id: 'COP',
      })),
      back_urls: {
        // 👇 aquí ya no está el localhost:5500, sino TU app
        success: `${FRONTEND_URL}/success.html`,
        failure: `${FRONTEND_URL}/failure.html`,
        pending: `${FRONTEND_URL}/pending.html`,
      },
      auto_return: 'approved', // si se aprueba, vuelve solo a success
    };

    const pref = new Preference(client);
    const result = await pref.create({ body: preferenceData });

    // El SDK nuevo a veces retorna en result o result.body, lo manejamos defensivo
    const id = result.id || (result.body && result.body.id);
    const init_point =
      result.init_point || (result.body && result.body.init_point);

    if (!init_point) {
      console.error('Respuesta inesperada de Mercado Pago:', result);
      return res.status(500).json({
        error: 'No se pudo crear la preferencia de pago.',
      });
    }

    return res.json({ id, init_point });
  } catch (error) {
    console.error('❌ Error creando preferencia:', error);
    return res.status(500).json({
      error: error.message || 'Error creando preferencia de pago',
      status: error.status,
    });
  }
});

module.exports = router;
