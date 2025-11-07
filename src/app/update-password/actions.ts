
'use server';

import { createServerClient } from '@/lib/supabaseServer';

export async function updatePassword(password: string) {
  const supabase = createServerClient();

  const { error } = await supabase.auth.updateUser({ password: password });

  if (error) {
    return {
      success: false,
      message: `Error al actualizar la contraseña: ${error.message}`,
    };
  }

  return {
    success: true,
    message: 'Contraseña actualizada correctamente.',
  };
}
