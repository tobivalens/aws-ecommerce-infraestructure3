// routes/payments.js
const express = require('express');
const router = express.Router();
require('dotenv').config();

// Usamos el mismo patrón que ya tenías
const mercadopago = require('mercadopago');
const { Preference } = require('mercadopago');

// 🟢 Inicializar SDK con tu access token
const client = new mercadopago.MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

router.post('/', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No se enviaron productos.' });
    }

    // 🌐 URL base del frontend (se adapta sola a local / ALB)
    const FRONTEND_URL = `${req.protocol}://${req.get('host')}`;

    const preference = {
      items: items.map((item) => ({
        title: item.title,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price),
        currency_id: 'COP',
      })),
      back_urls: {
        success: `${FRONTEND_URL}/success.html`,
        failure: `${FRONTEND_URL}/failure.html`,
        pending: `${FRONTEND_URL}/pending.html`,
      },
      auto_return: 'approved', // vuelve solo al success si se aprueba
    };

    const pref = new Preference(client);
    const result = await pref.create({ body: preference });

    // El SDK puede devolver la data directo o en .body, lo manejamos defensivo
    const body = result.body || result;
    const id = body.id;
    const init_point = body.init_point;

    if (!init_point) {
      console.error('⚠️ Mercado Pago no devolvió init_point. Respuesta:', body);
      return res.status(500).json({
        error: 'No se pudo crear la preferencia de pago.',
      });
    }

    // 👇 Esto es lo que tu frontend espera
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
