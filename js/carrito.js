/* ============================================================
   CARRITO DE COMPRAS
   ============================================================ */
let carrito = [];
const DESCUENTO_MINIMO = 250000;
const DESCUENTO_PORCENTAJE = 10;
let descuentoNotificado = false;

function agregarAlCarrito(prod, cantidad) {
  const existente = carrito.find(i => i.id === prod.id);
  if (existente) {
    const nuevaCant = existente.cantidad + cantidad;
    if (nuevaCant > prod.stock) { showToast(`Solo hay ${prod.stock} disponibles`, 'warn'); return; }
    existente.cantidad = nuevaCant;
  } else {
    carrito.push({ ...prod, cantidad });
  }
  actualizarCarrito();
  showToast(`${prod.nombre} agregado`, 'check');
}

function quitarDelCarrito(id) {
  carrito = carrito.filter(i => i.id !== id);
  actualizarCarrito();
}

function cambiarCantidadCarrito(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  const nueva = item.cantidad + delta;
  if (nueva < 1) { quitarDelCarrito(id); return; }
  const prod = PRODUCTOS.find(p => p.id === id);
  if (prod && nueva > prod.stock) { showToast('Sin más stock disponible', 'warn'); return; }
  item.cantidad = nueva;
  actualizarCarrito();
}

function actualizarCarrito() {
  const count = carrito.reduce((a, i) => a + i.cantidad, 0);
  document.getElementById('cart-count').textContent = count;

  const itemsEl = document.getElementById('cart-items');
  const totalesEl = document.getElementById('cart-totales');

  if (carrito.length === 0) {
    itemsEl.innerHTML = `<div class="empty-cart">${ICONS.bag}<p>Tu carrito está vacío</p></div>`;
    totalesEl.style.display = 'none';
  } else {
    itemsEl.innerHTML = carrito.map(i => {
      const imgHtml = i.foto_url ? `<img src="${i.foto_url}" alt="${i.nombre}">` : svgIconFor(i.categoria);
      return `
        <div class="cart-item">
          <div class="cart-item-img">${imgHtml}</div>
          <div class="cart-item-info">
            <div class="cart-item-nombre">${i.nombre}</div>
            <div class="cart-item-precio">${formatCOP(i.precio * i.cantidad)}</div>
            <div class="cart-item-qty">
              <button class="qty-mini" onclick="cambiarCantidadCarrito('${i.id}',-1)">−</button>
              <span class="qty-mini-num">${i.cantidad}</span>
              <button class="qty-mini" onclick="cambiarCantidadCarrito('${i.id}',1)">+</button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="quitarDelCarrito('${i.id}')">${ICONS.trash}</button>
        </div>
      `;
    }).join('');

    const { subtotal, descuento, total } = calcularTotales();
    document.getElementById('cart-subtotal').textContent = formatCOP(subtotal);
    document.getElementById('cart-descuento').textContent = '-' + formatCOP(descuento);
    document.getElementById('cart-total').textContent = formatCOP(total);
    document.getElementById('descuento-row').style.display = descuento > 0 ? 'flex' : 'none';
    totalesEl.style.display = 'block';
  }

  /* sincroniza el stepper de las tarjetas con el estado del carrito */
  if (typeof renderProductos === 'function') renderProductos();
}

function calcularTotales() {
  const subtotal = carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
  const aplica = subtotal > DESCUENTO_MINIMO;
  const descuento = aplica ? Math.round(subtotal * DESCUENTO_PORCENTAJE / 100) : 0;

  if (aplica && !descuentoNotificado) {
    descuentoNotificado = true;
    showToast(`¡Superaste ${formatCOP(DESCUENTO_MINIMO)}! 10% de descuento aplicado`, 'sparkle');
  } else if (!aplica) {
    descuentoNotificado = false;
  }

  return { subtotal, descuento, total: subtotal - descuento };
}

function abrirCarrito() { document.getElementById('cart-drawer').classList.add('open'); }
function cerrarCarrito() { document.getElementById('cart-drawer').classList.remove('open'); }


