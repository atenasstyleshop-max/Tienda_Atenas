# Atenas Style Shop — Tienda en línea

## Cómo agregar/editar cosas tú misma (sin pedirme código)

### 🖼️ Cambiar el banner del hero
Guarda tu imagen animada como `assets/banner-atenas.png` (mismo nombre exacto).
Si quieres usar un GIF, cámbiale el nombre del archivo en `index.html`,
línea del `<img id="hero-banner" ...>`, por `banner-atenas.gif`.

### 📝 Agregar descripciones de producto
Ábre `js/productos.js`, busca el objeto `DESCRIPCIONES` y agrega líneas así:
```js
const DESCRIPCIONES = {
  'REF-001': 'Tratamiento intensivo anticaída con keratina...',
  'REF-002': 'Aceite capilar 100% natural...',
};
```
La clave (`'REF-001'`) debe ser igual a la columna `referencia` de Supabase.

### 🗂️ Categorías
Las categorías están fijas en el código: capilar, facial, maquillaje,
accesorios, electricos, varios, ropa. En Supabase, cada producto debe tener
ese valor exacto (en minúsculas, sin tildes) en la columna `categoria`.

### 📦 Stock y precios
Se actualizan automáticamente desde Supabase — no necesitas tocar el código,
solo edita la tabla `productos` desde el ERP o el panel de Supabase.

### 🧾 Factura PDF
Se genera automáticamente al finalizar un pedido y se descarga en el navegador
del cliente. El diseño está en `js/factura-pdf.js`.

## Subir a Netlify
1. Arrastra toda esta carpeta (`atenas-style-shop`) a https://app.netlify.com/drop
2. Listo, te da una URL pública gratis.

## Pendiente (lo iremos agregando)
- [ ] Imagen del banner animado
- [ ] Descripciones de cada producto
- [ ] Columna `categoria` poblada en Supabase para los 8 productos actuales
- [ ] Método de pago en línea (link de pago con pasarela tipo Wompi/ePayco)
- [ ] Carrusel de varias fotos por producto
