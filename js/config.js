/* ============================================================
   CONFIGURACIÓN DE SUPABASE - ATENAS ERP
   ============================================================ */

const SUPABASE_URL = 'https://unotilulnvyncccctysy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8ZsADMugYaClaCSBI2tF8A_Rfzn-fTP';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* Datos del negocio (usados en checkout y factura PDF) */
const NEGOCIO = {
  nombre: 'Atenas Style Shop',
  ciudad: 'Cartagena, Colombia',
  telefono: '318 434 6975',
  whatsapp: '573184346975',
  instagram: '@atenas.style_ctg',
  logo: 'assets/logo.png',
};
