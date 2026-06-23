/* ============================================================
   CHECKOUT: datos del cliente y envío del pedido
   ============================================================ */

let metodoPago = 'efectivo';
let ubicacionCartagena = true;
let domicilioActual = 0;
let nombreBarrioActual = '';
let BARRIOS = [];

async function initBarrios() {
  BARRIOS = await fetchBarrios();
  const lista = document.getElementById('barrio-select-list');
  lista.innerHTML = BARRIOS.map(b => `
    <div class="custom-select-item" onclick="elegirBarrio('${b.nombre.replace(/'/g, "\\'")}', ${b.valor_domicilio})">
      <span>${b.nombre}</span>
      <span class="precio">${formatCOP(b.valor_domicilio)}</span>
    </div>
  `).join('');
}

function toggleBarrioDropdown() {
  document.getElementById('barrio-select-list').classList.toggle('open');
}

function elegirBarrio(nombre, precio) {
  domicilioActual = precio;
  nombreBarrioActual = nombre;
  document.getElementById('barrio-select-label').textContent = nombre;
  document.getElementById('barrio-select-list').classList.remove('open');
  renderResumen();
}

document.addEventListener('click', (e) => {
  const wrap = document.getElementById('barrio-select-wrap');
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById('barrio-select-list').classList.remove('open');
  }
});

function seleccionarUbicacion(esCartagena) {
  ubicacionCartagena = esCartagena;
  document.getElementById('opt-ciudad-si').classList.toggle('selected', esCartagena);
  document.getElementById('opt-ciudad-no').classList.toggle('selected', !esCartagena);
  document.getElementById('bloque-cartagena').style.display = esCartagena ? 'block' : 'none';
  document.getElementById('bloque-fuera').style.display = esCartagena ? 'none' : 'block';
  document.getElementById('metodo-cartagena').style.display = esCartagena ? 'block' : 'none';
  document.getElementById('metodo-fuera').style.display = esCartagena ? 'none' : 'block';
  document.getElementById('aviso-envio-fuera').style.display = esCartagena ? 'none' : 'block';
  metodoPago = esCartagena ? 'efectivo' : 'contraentrega';
  document.querySelectorAll('#metodo-cartagena .pago-opt, #metodo-fuera .pago-opt').forEach(el => el.classList.remove('selected'));
  document.getElementById(esCartagena ? 'opt-efectivo' : 'opt-contraentrega').classList.add('selected');
  actualizarVisibilidadPago();
  renderResumen();
}

function seleccionarPago(tipo) {
  metodoPago = tipo;
  const grupo = ubicacionCartagena ? '#metodo-cartagena' : '#metodo-fuera';
  document.querySelectorAll(`${grupo} .pago-opt`).forEach(el => el.classList.remove('selected'));
  const idMap = { efectivo: 'opt-efectivo', transferencia: ubicacionCartagena ? 'opt-transferencia' : 'opt-transferencia-fuera', contraentrega: 'opt-contraentrega' };
  document.getElementById(idMap[tipo]).classList.add('selected');
  actualizarVisibilidadPago();
}

function actualizarVisibilidadPago() {
  document.getElementById('aviso-contraentrega').style.display = metodoPago === 'contraentrega' ? 'block' : 'none';
}

function abrirCheckout() {
  if (carrito.length === 0) return;
  cerrarCarrito();
  renderResumen();
  document.getElementById('checkout-modal').classList.add('open');
}
function cerrarCheckout() { document.getElementById('checkout-modal').classList.remove('open'); }

function totalConDomicilio() {
  const { subtotal, descuento, total } = calcularTotales();
  const domicilio = ubicacionCartagena ? domicilioActual : 0;
  return { subtotal, descuento, domicilio, total: total + domicilio };
}

function renderResumen() {
  const { subtotal, descuento, domicilio, total } = totalConDomicilio();
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
    ${domicilio > 0 ? `<div class="resumen-item-row">
      <span>Domicilio</span>
      <span>${formatCOP(domicilio)}</span>
    </div>` : ''}
    <div class="resumen-total-row"><span>Total</span><span>${formatCOP(total)}</span></div>
  `;
}

async function enviarPedido() {
  const datos = validarFormulario();
  if (!datos) return;

  const { nombreCompleto, tel, ciudad, direccion, cedula } = datos;
  const { subtotal, descuento, domicilio, total } = totalConDomicilio();
  const pagoLabel = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    contraentrega: 'Contra Entrega'
  }[metodoPago] || metodoPago;

  const datosCliente = { nombre: nombreCompleto, tel, ciudad, direccion, cedula, pagoLabel };

  const e1 = String.fromCodePoint(0x1FA75);
  const e2 = String.fromCodePoint(0x1F4E6);
  const e3 = String.fromCodePoint(0x2728);
  const pt = String.fromCodePoint(0x2022);

  const lineas = [
    `Hola, Atenas ${e1}`,
    ``,
    `estoy interesad@ en este pedido ${e2}`,
    ``,
    `Estos son mis datos:`,
    ``,
    `${pt} Nombre: ${nombreCompleto}`,
    `${pt} Tel\u00e9fono: ${tel}`,
    cedula ? `${pt} C\u00e9dula: ${cedula}` : null,
    `${pt} Ciudad: ${ciudad}`,
    `${pt} Direcci\u00f3n: ${direccion}`,
    `${pt} M\u00e9todo de pago: ${pagoLabel}`,
    !ubicacionCartagena ? `${pt} El valor del env\u00edo se cotiza despu\u00e9s y es adicional.` : null,
    metodoPago === 'contraentrega' ? `${pt} Se paga contra entrega, pero el env\u00edo se paga anticipado.` : null,
    ``,
    `Quedo atenta a la Confirmaci\u00f3n ${e3}`,
  ].filter(l => l !== null).join('\n');

  const urlWA = `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(lineas)}`;

  /* Intentar generar PDF */
  let pdfData = null;
  try {
    pdfData = await generarFacturaPDF(datosCliente, carrito, { subtotal, descuento, domicilio, total });
  } catch (e) {
    console.error('Error PDF:', e);
  }

  /* CELULAR con Web Share API — manda mensaje + PDF juntos */
  if (pdfData && navigator.canShare) {
    const archivo = new File([pdfData.blob], pdfData.nombreArchivo, { type: 'application/pdf' });
    if (navigator.canShare({ files: [archivo] })) {
      try {
        await navigator.share({
          files: [archivo],
          text: lineas,
          title: 'Pedido Atenas Style Shop'
        });
        cerrarCheckout();
        showToast('Pedido enviado', 'check');
        return;
      } catch (err) {async function enviarPedido() {
  const datos = validarFormulario();
  if (!datos) return;

  const { nombreCompleto, tel, ciudad, direccion, cedula } = datos;
  const { subtotal, descuento, domicilio, total } = totalConDomicilio();
  const pagoLabel = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    contraentrega: 'Contra Entrega'
  }[metodoPago] || metodoPago;

  const e1 = String.fromCodePoint(0x1FA75);
  const e2 = String.fromCodePoint(0x1F4E6);
  const e3 = String.fromCodePoint(0x2728);
  const e4 = String.fromCodePoint(0x1F4CB);
  const pt = String.fromCodePoint(0x2022);

  const lineas = [
    `Hola, Atenas ${e1}`,
    ``,
    `estoy interesad@ en este pedido ${e2}`,
    ``,
    `*Mis datos:*`,
    `${pt} Nombre: ${nombreCompleto}`,
    `${pt} Tel\u00e9fono: ${tel}`,
    cedula ? `${pt} C\u00e9dula: ${cedula}` : null,
    `${pt} Ciudad: ${ciudad}`,
    `${pt} Direcci\u00f3n: ${direccion}`,
    `${pt} Pago: ${pagoLabel}`,
    !ubicacionCartagena ? `${pt} El env\u00edo se cotiza despu\u00e9s.` : null,
    metodoPago === 'contraentrega' ? `${pt} El env\u00edo se paga anticipado.` : null,
    ``,
    `*Resumen del pedido* ${e4}`,
    ``,
    ...carrito.map(i => `${pt} ${i.nombre} x${i.cantidad} ........... ${formatCOP(i.precio * i.cantidad)}`),
    ``,
    descuento > 0 ? `Descuento aplicado: -${formatCOP(descuento)}` : null,
    domicilio > 0 ? `Domicilio: ${formatCOP(domicilio)}` : null,
    ``,
    `*TOTAL: ${formatCOP(total)}*`,
    ``,
    `Quedo atenta a la Confirmaci\u00f3n ${e3}`,
  ].filter(l => l !== null).join('\n');

  window.open(`https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(lineas)}`, '_blank');
  cerrarCheckout();

  /* Guardar datos para la factura por si la quiere descargar después */
  window._ultimoPedido = {
    datosCliente: { nombre: nombreCompleto, tel, ciudad, direccion, cedula, pagoLabel },
    items: [...carrito],
    totales: { subtotal, descuento, domicilio, total }
  };

  /* Mostrar botón flotante para descargar la factura */
  mostrarBotonFactura();
}

function mostrarBotonFactura() {
  let btn = document.getElementById('btn-factura-flotante');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'btn-factura-flotante';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Descargar factura PDF`;
    btn.onclick = descargarFacturaPedido;
    document.body.appendChild(btn);
  }
  btn.style.display = 'flex';

  /* Se oculta solo después de 30 segundos */
  setTimeout(() => { btn.style.display = 'none'; }, 30000);
}

async function descargarFacturaPedido() {
  if (!window._ultimoPedido) return;
  const { datosCliente, items, totales } = window._ultimoPedido;
  try {
    const pdfData = await generarFacturaPDF(datosCliente, items, totales);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(pdfData.blob);
    a.download = pdfData.nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Factura descargada', 'check');
    document.getElementById('btn-factura-flotante').style.display = 'none';
  } catch (e) {
    showToast('Error generando la factura', 'warn');
  }
}