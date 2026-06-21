/* ============================================================
   ICONOS SVG (reemplazan emojis en toda la tienda)
   ============================================================ */

const ICONS = {
  check: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>',
  warn: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  sparkle: '<svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.2 3.6 3.6 6 7.2 7.2-3.6 1.2-6 3.6-7.2 7.2-1.2-3.6-3.6-6-7.2-7.2C8.4 8 10.8 5.6 12 2z"/></svg>',
  bag: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
  plus: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>',
  close: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

/* Iconos por categoría — 7 categorías del negocio */
const CATEGORIA_ICONS = {
  capilar: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 4v3M9 4v3M13 4v3M17 4v3"/><path d="M4 7h16"/><path d="M7 7c0 6-2 9-2 13M12 7c0 6 1 9 1 13M17 7c0 6 2 9 2 13"/></svg>',
  facial: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M9.5 10.5h.01M14.5 10.5h.01"/><path d="M9 15c1.2 1 4.8 1 6 0"/></svg>',
  corporal: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><path d="M9 9h6l1.5 6h-2.5l-.5 7h-3l-.5-7h-2.5l1.5-6z"/></svg>',
  maquillaje: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2.5h6l.8 4.5-3.8 14-3.8-14.5z"/><path d="M9.3 7h5.4"/></svg>',
  accesorios: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 7v10l6.5-5z"/><path d="M20 7v10l-6.5-5z"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
  electricos: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v5M15 2v5"/><path d="M6 7h12v4a6 6 0 0 1-12 0V7z"/><path d="M12 17v5"/></svg>',
  varios: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8 12 3.5 20.5 8 12 12.5 3.5 8z"/><path d="M3.5 8v8L12 20.5 20.5 16V8"/><path d="M12 12.5V20.5"/></svg>',
  ropa: '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3 5 6l1.5 3L9 8v12h6V8l2.5 1L19 6l-4-3-1.8 2h-2.4z"/></svg>',
};

function svgIconFor(categoria) {
  return CATEGORIA_ICONS[categoria] || ICONS.sparkle;
}
