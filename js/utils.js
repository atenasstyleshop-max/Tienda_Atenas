/* ============================================================
   UTILIDADES GENERALES
   ============================================================ */

function formatCOP(n) {
  return '$' + Math.round(n).toLocaleString('es-CO');
}

function showToast(msg, tipo = 'check') {
  const t = document.getElementById('toast');
  t.innerHTML = (ICONS[tipo] || ICONS.check) + `<span>${msg}</span>`;
  t.classList.add('show');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => t.classList.remove('show'), 2500);
}
