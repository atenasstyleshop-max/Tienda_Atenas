/* ============================================================
   CHECKOUT: datos del cliente y envío del pedido
   ============================================================ */

let metodoPago = 'efectivo';
let ubicacionCartagena = true;

function seleccionarUbicacion(esCartagena) {
  ubicacionCartagena = esCartagena;
  document.getElementById('opt-ciudad-si').classList.toggle('selected', esCartagena);
  document.getElementById('opt-ciudad-no').classList.toggle('selected', !esCartagena);
  document.getElementById('bloque-cartagena').style.display = esCartagena ? 'block' : 'none';
  document.getElementById('bloque-fuera').style.display = esCartagena ? 'none' : 'block';
  document.getElementById('metodo-cartagena').style.display = esCartagena ? 'block' : 'none';
  document.getElementById('metodo-fuera').style.display = esCartagena ? 'none' : 'block';
  metodoPago = esCartagena ? 'efectivo' : 'contraentrega';
  document.querySelectorAll('#metodo-cartagena .pago-opt, #metodo-fuera .pago-opt').forEach(el => el.classList.remove('selected'));
  document.getElementById(esCartagena ? 'opt-efectivo' : 'opt-contraentrega').classList.add('selected');
  actualizarVisibilidadPago();
}

function seleccionarPago(tipo) {
  metodoPago = tipo;
  const grupo = ubicacionCartagena ? '#metodo-cartagena' : '#metodo-fuera';
  document.querySelectorAll(`${grupo} .pago-opt`).forEach(el => el.classList.remove('selected'));
  const idMap = { efectivo: 'opt-efectivo', wompi: ubicacionCartagena ? 'opt-wompi' : 'opt-wompi-fuera', contraentrega: 'opt-contraentrega' };
  document.getElementById(idMap[tipo]).classList.add('selected');
  actualizarVisibilidadPago();

  // Wompi: por ahora redirige directo (cuando tengas la llave, aquí se abre el Web Checkout)
  if (tipo === 'wompi') {
    showToast('Pronto conectamos el pago en línea con Wompi', 'check');
  }
}

function actualizarVisibilidadPago() {
  document.getElementById('bloque-cedula').style.display = metodoPago === 'contraentrega' ? 'block' : 'none';
  document.getElementById('aviso-contraentrega').style.display = metodoPago === 'contraentrega' ? 'block' : 'none';
}

function abrirCheckout() {
  if (carrito.length === 0) return;
  cerrarCarrito();
  renderResumen();
  document.getElementById('checkout-modal').classList.add('open');
}
function cerrarCheckout() { document.getElementById('checkout-modal').classList.remove('open'); }



function renderResumen() {
  const { subtotal, descuento, total } = calcularTotales();
  const el = document.getElementById('ch-resumen');
  el.innerHTML = `
    <h4>Resumen del pedido</h4>
    ${carrito.map(i => `
      <div class="resumen-item-row">
        <span>${i.nombre} x${i.cantidad}</span>
        <span>${formatCOP(i.precio * i.cantidad)}</span>
      </div>
    `).join('')}
    ${descuento > 0 ? `<div class="resumen-item-row" style="color:var(--verde);">
      <span>Descuento (10% por compra +${formatCOP(250000)})</span>
      <span>-${formatCOP(descuento)}</span>
    </div>` : ''}
    <div class="resumen-total-row"><span>Total</span><span>${formatCOP(total)}</span></div>
  `;
}

async function enviarPedido() {
  const nombre = document.getElementById('ch-nombre').value.trim();
  const tel = document.getElementById('ch-tel').value.trim();

  if (!nombre) { showToast('Falta tu nombre', 'warn'); return; }
  if (!tel) { showToast('Falta tu WhatsApp', 'warn'); return; }

  let cedula = '';
  if (metodoPago === 'contraentrega') {
    cedula = document.getElementById('ch-cedula').value.trim();
    if (!cedula) { showToast('Falta tu número de cédula', 'warn'); return; }
  }

  let ciudad, direccion;

  if (ubicacionCartagena) {
    const barrio = document.getElementById('ch-barrio').value.trim();
    const dir = document.getElementById('ch-direccion').value.trim();
    const referencia = document.getElementById('ch-referencia').value.trim();
    if (!barrio) { showToast('Falta el barrio', 'warn'); return; }
    if (!dir) { showToast('Falta la dirección', 'warn'); return; }
    ciudad = 'Cartagena';
    direccion = `${barrio}, ${dir}${referencia ? ' (Ref: ' + referencia + ')' : ''}`;
  } else {
    const ciudadFuera = document.getElementById('ch-ciudad').value.trim();
    const barrioFuera = document.getElementById('ch-barrio-fuera').value.trim();
    const dirFuera = document.getElementById('ch-direccion-fuera').value.trim();
    if (!ciudadFuera) { showToast('Falta la ciudad', 'warn'); return; }
    if (!dirFuera) { showToast('Falta la dirección', 'warn'); return; }
    ciudad = ciudadFuera;
    direccion = `${barrioFuera ? barrioFuera + ', ' : ''}${dirFuera}`;
  }

  const { subtotal, descuento, total } = calcularTotales();

  const pagoLabel = { efectivo: 'Efectivo', wompi: 'Pago en línea (Wompi)', contraentrega: 'Contra Entrega' }[metodoPago];

  const datosCliente = { nombre, tel, ciudad, direccion, cedula, pagoLabel };

  /* Genera y descarga la factura en PDF (versión simple, sin backend) */
  try {
    await generarFacturaPDF(datosCliente, carrito, { subtotal, descuento, total });
  } catch (e) {
    console.error('No se pudo generar la factura PDF:', e);
  }

  const lineas = [
    `NUEVO PEDIDO — ${NEGOCIO.nombre}`,
    ``,
    `Cliente: ${nombre}`,
    `WhatsApp: ${tel}`,
    cedula ? `Cédula: ${cedula}` : null,
    `Ciudad: ${ciudad}`,
    `Dirección: ${direccion}`,
    `Pago: ${pagoLabel}`,
    metodoPago === 'contraentrega' ? 'Nota: el valor del envío se cotiza después, según tu ciudad.' : null,
    ubicacionCartagena ? 'Nota: el valor del domicilio es adicional.' : null,
    ``,
    `Productos:`,
    ...carrito.map(i => `  • ${i.nombre} x${i.cantidad} — ${formatCOP(i.precio * i.cantidad)}`),
    ``,
    descuento > 0 ? `Descuento: -${formatCOP(descuento)}` : null,
    `TOTAL: ${formatCOP(total)}`,
    `\nAdjunto la factura en PDF que se descargó.`,
  ].filter(Boolean).join('\n');
  const url = `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(lineas)}`;
  window.open(url, '_blank');
  cerrarCheckout();
  showToast('Factura descargada. Redirigiendo a WhatsApp...', 'check');
}
