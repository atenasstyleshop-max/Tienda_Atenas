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
  const nombre = document.getElementById('ch-nombre').value.trim();
  const apellido = document.getElementById('ch-apellido').value.trim();
  const tel = document.getElementById('ch-tel').value.trim();

  if (!nombre) { showToast('Falta tu nombre', 'warn'); return; }
  if (!tel) { showToast('Falta tu WhatsApp', 'warn'); return; }

  let ciudad, direccion, cedula = '';

  if (ubicacionCartagena) {
    if (!nombreBarrioActual) { showToast('Selecciona tu barrio', 'warn'); return; }
    const dir = document.getElementById('ch-direccion').value.trim();
    const referencia = document.getElementById('ch-referencia').value.trim();
    if (!dir) { showToast('Falta la dirección', 'warn'); return; }
    ciudad = 'Cartagena';
    direccion = `${nombreBarrioActual}, ${dir}${referencia ? ' (Punto de Referencia: ' + referencia + ')' : ''}`;
  } else {
    const ciudadFuera = document.getElementById('ch-ciudad').value.trim();
    const dirFuera = document.getElementById('ch-direccion-fuera').value.trim();
    cedula = document.getElementById('ch-cedula').value.trim();
    if (!ciudadFuera) { showToast('Falta la ciudad', 'warn'); return; }
    if (!dirFuera) { showToast('Falta la dirección', 'warn'); return; }
    if (!cedula) { showToast('Falta tu número de cédula', 'warn'); return; }
    ciudad = ciudadFuera;
    direccion = dirFuera;
  }

 const { subtotal, descuento, domicilio, total } = totalConDomicilio();
  const pagoLabel = { efectivo: 'Efectivo', transferencia: 'Transferencia', contraentrega: 'Contra Entrega' }[metodoPago];
  const nombreCompleto = `${nombre} ${apellido}`.trim();

  const datosCliente = { nombre: nombreCompleto, tel, ciudad, direccion, cedula, pagoLabel };

  const mensaje = [
    `Hola, Atenas 🩵`,
    ``,
    `estoy interesad@ en este pedido 📦`,
    ``,
    `Estos son mis datos:`,
    ``,
    `* Nombre: ${nombreCompleto}`,
    `* Teléfono: ${tel}`,
    cedula ? `* Cédula: ${cedula}` : null,
    `* Ciudad: ${ciudad}`,
    `* Dirección: ${direccion}`,
    `* Método de pago: ${pagoLabel}`,
    (!ubicacionCartagena || metodoPago === 'contraentrega') ? `` : null,
    !ubicacionCartagena ? 'El valor del envío se cotiza después y es adicional.' : null,
    metodoPago === 'contraentrega' ? 'Se paga contra entrega, pero el envío se paga anticipado.' : null,
    ``,
    `Quedo atenta a la Confirmación ✨`,
  ].filter(line => line !== null).join('\n');

  let pdfData = null;
  try {
    pdfData = await generarFacturaPDF(datosCliente, carrito, { subtotal, descuento, domicilio, total });
  } catch (e) {
    console.error('No se pudo generar la factura PDF:', e);
  }

  // Intenta compartir directo a WhatsApp con el PDF adjunto (funciona en celular)
  if (pdfData && navigator.canShare) {
    const pdfFile = new File([pdfData.blob], pdfData.nombreArchivo, { type: 'application/pdf' });
    if (navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({ files: [pdfFile], text: mensaje, title: 'Pedido Atenas Style Shop' });
        cerrarCheckout();
        showToast('Pedido enviado', 'check');
        return;
      } catch (e) {
        if (e.name === 'AbortError') return; // el usuario canceló
      }
    }
  }

  // Alternativa en computador: descarga el PDF y abre WhatsApp con el mensaje
  if (pdfData) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(pdfData.blob);
    a.download = pdfData.nombreArchivo;
    a.click();
  }
  const url = `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
  cerrarCheckout();
  showToast('Factura descargada. Adjúntala en WhatsApp manualmente', 'check');
}