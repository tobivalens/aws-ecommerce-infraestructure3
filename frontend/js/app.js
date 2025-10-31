$(document).ready(async function () {
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
    console.log("➡️ Haciendo fetch a:", `${API_URL}/products`);
    const res = await fetch(`${API_URL}/products`);
    console.log("⬅️ Respuesta recibida:", res.status);
    const productos = await res.json();
    console.log("📦 Productos:", productos);

    productos.forEach((prod) => {
      $("#lista-productos").append(`
        <div class="producto">
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
    alert("Error cargando productos");
  }

  // ====== Renderizar carrito ======
  function renderCarrito() {
    $("#items-carrito").empty();
    let total = 0;

    carrito.forEach((item) => {
      const precio = Number(item.precio) || 0;
      $("#items-carrito").append(`
        <li>
          ${item.nombre} - $${precio.toLocaleString()}
          <button class="btn-remove" data-id="${item.id}">x</button>
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
      console.error("⚠️ Error al agregar producto: datos inválidos", { id, nombre, precio });
      alert("Error al agregar producto.");
      return;
    }

    carrito.push({ id, nombre, precio });
    renderCarrito();
  });

  // ====== Eliminar producto del carrito ======
  $(document).on("click", ".btn-remove", function () {
    const id = Number($(this).data("id"));
    carrito = carrito.filter((p) => p.id !== id);
    renderCarrito();
  });

  // ====== Ir al pago ======
  $("#btn-pagar").click(() => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }
    window.location.href = "checkout.html";
  });

  // ====== Cargar carrito existente al abrir ======
  renderCarrito();
});
