$(document).ready(async function () {
  // Usar el mismo host desde donde se carga el frontend (ALB, dominio, etc.)
  // "/api" → las peticiones van a /api/products, /api/payments en el mismo dominio
  const API_URL = "/api";
  console.log("🔄 Cargando productos desde:", API_URL);

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (!token) {
    alert("Debes iniciar sesión primero");
    window.location.href = "login.html";
    return;
  }

  $("#user-info").text(`👋 Hola, ${username}`);

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // ====== Cargar productos desde el backend ======
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error("Error al obtener productos");
    const productos = await res.json();

    productos.forEach((prod) => {
      const imagenSrc = prod.imagen || "img/default.jpg";
      $("#lista-productos").append(`
        <div class="producto">
          <img src="${imagenSrc}" alt="${prod.nombre}" class="producto-img">
          <h3>${prod.nombre}</h3>
          <p>${prod.descripcion}</p>
          <p><strong>$${Number(prod.precio).toLocaleString()}</strong></p>
          <button class="btn-add"
                  data-id="${prod.id}"
                  data-nombre="${prod.nombre}"
                  data-precio="${prod.precio}">
            Agregar al carrito
          </button>
        </div>
      `);
    });
  } catch (err) {
    console.error("❌ Error en fetch:", err);
    alert("Error cargando productos.");
  }

  // ====== Renderizar carrito ======
  function renderCarrito() {
    $("#items-carrito").empty();
    let total = 0;

    carrito.forEach((item, index) => {
      const precio = Number(item.precio) || 0;
      $("#items-carrito").append(`
        <li>
          ${item.nombre} - $${precio.toLocaleString()}
          <button class="btn-remove" data-index="${index}">x</button>
        </li>
      `);
      total += precio;
    });

    $("#total").text(`Total: $${total.toLocaleString()}`);
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  // ====== Agregar producto al carrito ======
  $(document).on("click", ".btn-add", function () {
    const id = Number($(this).data("id"));
    const nombre = $(this).data("nombre");
    const precio = Number($(this).data("precio"));

    if (!id || !nombre || isNaN(precio)) {
      alert("Error al agregar producto.");
      return;
    }

    carrito.push({ id, nombre, precio });
    renderCarrito();
  });

  // ====== Eliminar producto del carrito ======
  $(document).on("click", ".btn-remove", function () {
    const index = $(this).data("index");
    carrito.splice(index, 1);
    renderCarrito();
  });

  // ====== Ir al pago (Mercado Pago Sandbox) ======
  $("#btn-pagar").click(async () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    try {
      console.log("🧾 Enviando carrito a backend:", carrito);

      const response = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: carrito.map(p => ({
            title: p.nombre,
            quantity: 1,
            unit_price: Number(p.precio)
          }))
        })
      });

      const data = await response.json();
      console.log("📦 Respuesta backend:", data);

      if (!data.init_point) {
        alert("Error al generar el pago. Intenta nuevamente.");
        console.error("❌ Error creando preferencia:", data);
        return;
      }

      // 🔹 Redirigir al checkout de Mercado Pago
      console.log("✅ Redirigiendo a Mercado Pago:", data.init_point);
      window.location.href = data.init_point;

    } catch (error) {
      console.error("❌ Error procesando pago:", error);
      alert("No se pudo iniciar el pago. Intenta nuevamente.");
    }
  });

  // ====== Cargar carrito existente al abrir ======
  renderCarrito();
});
