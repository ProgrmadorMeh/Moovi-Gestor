import { supabase } from '@/lib/supabaseServer';

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Falta el ID del usuario' }), { status: 400 });
    }

    // Eliminar de la tabla 'user'
    const { error: tableError } = await supabase.from('user').delete().eq('id', userId);
    if (tableError) throw tableError;

    // Eliminar de Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return new Response(JSON.stringify({ success: true, userId }), { status: 200 });

  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    return new Response(JSON.stringify({ error: err.message || 'Error interno' }), { status: 500 });
  }
}
