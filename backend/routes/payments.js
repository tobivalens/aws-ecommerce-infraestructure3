// routes/payments.js
const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');
require('dotenv').config();

// 🟢 Inicializar el SDK correctamente
const client = new mercadopago.MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});
const { Preference } = require('mercadopago');

router.post('/', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No se enviaron productos." });
    }

    // 🔹 Estructura válida de preferencia
    const preference = {
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        currency_id: "COP"
      })),
      back_urls: {
        success: "http://localhost:5500/success.html",
        failure: "http://localhost:5500/failure.html",
        pending: "http://localhost:5500/pending.html"
      },
      //auto_return: "approved"
    };

    const pref = new Preference(client);
    const result = await pref.create({ body: preference });

    res.json({
      id: result.id,
      init_point: result.init_point
    });

  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    res.status(500).json({
      error: error.message || "Error creando preferencia de pago",
      status: error.status
    });
  }
});

module.exports = router;
