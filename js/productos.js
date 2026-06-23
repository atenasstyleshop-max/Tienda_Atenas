/* ============================================================
   PRODUCTOS: carga, render, filtros, modal y stepper
   ============================================================ */

const CATEGORIAS = [
 { valor: 'todos', label: 'Todos', icon: true },
  { valor: 'capilar', label: 'Capilar' },
  { valor: 'facial', label: 'Facial' },
  { valor: 'corporal', label: 'Corporal' },
  { valor: 'maquillaje', label: 'Maquillaje' },
  { valor: 'accesorios', label: 'Accesorios' },
  { valor: 'electricos', label: 'Eléctricos' },
  { valor: 'varios', label: 'Varios' },
  { valor: 'ropa', label: 'Ropa' },
];

let PRODUCTOS = [];
let filtroActivo = 'todos';
let textoBusqueda = '';
let prodModal = null;
let qtyModal = 1;

function getDescripcion(p) {
  return p.descripcion || '';
}

function getStockInfo(stock) {
  if (stock === 0) return { label: 'Sin stock', clase: 'agotado' };
  if (stock <= 10) return { label: 'Pocas unidades', clase: 'bajo' };
  return { label: 'Disponible', clase: 'ok' };
}

function renderFiltros() {
  const cont = document.getElementById('filtros');
  cont.innerHTML = CATEGORIAS.map(c => `
    <button class="filtro-btn ${c.valor === filtroActivo ? 'active' : ''}" onclick="filtrar('${c.valor}', this)">
      ${svgIconFor(c.valor === 'todos' ? 'todos' : c.valor)} ${c.label}
    </button>
  `).join('');
}

function filtrar(cat, btn) {
  filtroActivo = cat;
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProductos();
}

function buscarProductos(texto) {
  textoBusqueda = texto.trim().toLowerCase();
  renderProductos();
}

function renderProductos() {
  const grid = document.getElementById('productos-grid');
  let lista = filtroActivo === 'todos' ? PRODUCTOS : PRODUCTOS.filter(p => p.categoria === filtroActivo);
  if (textoBusqueda) {
    lista = lista.filter(p => p.nombre.toLowerCase().includes(textoBusqueda));
  }
  if (!lista.length) {
    grid.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gris-60);grid-column:1/-1;">No hay productos en esta categoría.</div>';
    return;
  }

  grid.innerHTML = lista.map(p => {
    const stockInfo = getStockInfo(p.stock);
    const agotado = p.stock === 0;
    const imgHtml = p.foto_url ? `<img src="${p.foto_url}" alt="${p.nombre}">` : svgIconFor(p.categoria);
    const enCarrito = carrito.find(i => i.id === p.id);

    const controlHtml = agotado
      ? `<button class="btn-agregar" disabled>${ICONS.plus}</button>`
      : enCarrito
        ? `<div class="stepper">
             <button onclick="event.stopPropagation();cambiarCantidadCarrito('${p.id}',-1)">−</button>
             <span class="stepper-num">${enCarrito.cantidad}</span>
             <button onclick="event.stopPropagation();cambiarCantidadCarritoDesdeCard('${p.id}',1)">+</button>
           </div>`
        : `<button class="btn-agregar" onclick="event.stopPropagation();agregarRapido('${p.id}')">${ICONS.plus}</button>`;

    return `
      <div class="prod-card ${agotado ? 'sin-stock' : ''}">
        <div class="prod-img" onclick="${agotado ? '' : `abrirModal('${p.id}')`}">
          ${imgHtml}
          ${agotado ? `<span class="stock-badge agotado">Sin stock</span>` : ''}
        </div>
        <div class="prod-info">
          <div class="prod-nombre" onclick="${agotado ? '' : `abrirModal('${p.id}')`}">${p.nombre}</div>
          <div class="prod-footer">
            <div class="prod-precio">
            ${formatCOP(p.precio)}
            <span class="prod-tipo-badge ${p.tipo_venta === 'detal' ? 'detal' : 'mayor'}">${p.tipo_venta === 'detal' ? 'Al detal' : 'Por mayor'}</span>
          </div>
            ${controlHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function cambiarCantidadCarritoDesdeCard(id, delta) {
  cambiarCantidadCarrito(id, delta);
}

/* ── MODAL PRODUCTO ── */
function abrirModal(id) {
  prodModal = PRODUCTOS.find(p => p.id === id);
  if (!prodModal) return;
  qtyModal = 1;

  document.getElementById('modal-img').innerHTML = prodModal.foto_url
    ? `<img src="${prodModal.foto_url}" alt="${prodModal.nombre}">`
    : svgIconFor(prodModal.categoria);

  document.getElementById('modal-nombre').textContent = prodModal.nombre;
  document.getElementById('modal-desc').textContent = getDescripcion(prodModal);
 const tipoBadge = `<span class="prod-tipo-badge ${prodModal.tipo_venta === 'detal' ? 'detal' : 'mayor'}">${prodModal.tipo_venta === 'detal' ? 'Al detal' : 'Por mayor'}</span>`;
  document.getElementById('modal-precio').innerHTML = formatCOP(prodModal.precio) + ' ' + tipoBadge;
  document.getElementById('modal-qty').textContent = 1;

  const stockInfo = getStockInfo(prodModal.stock);
  const badge = document.getElementById('modal-stock-badge');
  if (prodModal.stock === 0) {
    badge.innerHTML = ICONS.warn + ' Sin stock';
    badge.style.background = '#fef2f2'; badge.style.color = '#dc2626';
  } else if (prodModal.stock <= 10) {
    badge.innerHTML = ICONS.sparkle + ' Pocas unidades';
    badge.style.background = '#fffbeb'; badge.style.color = '#b45309';
  } else {
    badge.innerHTML = ICONS.check + ' Disponible';
    badge.style.background = '#f0fdf4'; badge.style.color = '#15803d';
  }

  document.getElementById('overlay-prod').classList.add('open');
}

function cerrarModal() {
  document.getElementById('overlay-prod').classList.remove('open');
  prodModal = null;
}

function cambiarQty(delta) {
  if (!prodModal) return;
  const nueva = qtyModal + delta;
  if (nueva < 1 || nueva > prodModal.stock) return;
  qtyModal = nueva;
  document.getElementById('modal-qty').textContent = qtyModal;
}

function agregarDesdeModal() {
  if (!prodModal) return;
  agregarAlCarrito(prodModal, qtyModal);
  cerrarModal();
}

function agregarRapido(id) {
  const p = PRODUCTOS.find(x => x.id === id);
  if (p && p.stock > 0) agregarAlCarrito(p, 1);
}

/* ── INIT ── */
async function initProductos() {
  renderFiltros();
  PRODUCTOS = await fetchProductos();
  renderProductos();
}
