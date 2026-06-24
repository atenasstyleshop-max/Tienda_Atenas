/* ============================================================
   CONEXIÓN A SUPABASE — TRAE PRODUCTOS Y STOCK REAL
   ============================================================

   IMPORTANTE: la tabla "productos" debe tener una columna
   "categoria" con alguno de estos valores exactos:
   capilar | facial | maquillaje | accesorios | electricos | varios | ropa

   Si la columna no existe todavía, créala en Supabase:
   ALTER TABLE productos ADD COLUMN categoria text;
   ============================================================ */

async function fetchProductos() {
  const { data, error } = await sb
    .from('productos')
    .select('id, referencia, nombre, precio, stock, categoria, foto_url, descripcion, tipo_venta')
    .eq('mostrar_en_tienda', true)
    .order('stock', { ascending: false });

  if (error) {
    console.error('Error cargando productos de Supabase:', error);
    showToast('No se pudieron cargar los productos', 'warn');
    return [];
  }

  return data || [];
}
async function fetchBarrios() {
  const { data, error } = await sb.from('barrios_cartagena').select('*').order('nombre');
  if (error) { console.error('Error cargando barrios:', error); return []; }
  return data || [];
}
async function fetchCiudades() {
  const { data, error } = await sb
    .from('ciudades_colombia')
    .select('nombre, departamento')
    .order('nombre');
  if (error) { console.error('Error cargando ciudades:', error); return []; }
  return data || [];
}