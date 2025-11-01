'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { logOut } from '@/lib/functions/log/logOut.js';
import { supabase } from '@/lib/supabaseClient.js';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const pathToTitle: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/inventario': 'Inventario',
  '/inventario/nuevo': 'Cargar Nuevo Celular',
  '/ventas': 'Registro de Ventas',
  '/ventas/nueva': 'Registrar Nueva Venta',
  '/usuarios': 'Administración de Usuarios',
};

export function AppHeader() {
  const pathname = usePathname();
  const title = pathToTitle[pathname] || 'Moovi';
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const result = await logOut();
    if (result.success) {
      setUser(null);
      router.push('/login');
      toast({
        title: 'Sesión Cerrada',
        description: 'Has cerrado sesión correctamente.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/60 px-4 backdrop-blur-sm sm:px-6 sticky top-0 z-30">
      <SidebarTrigger className="md:hidden" />
      
      <div className="flex-1">
        <h1 className="font-semibold text-lg hidden sm:block">{title}</h1>
      </div>

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" alt="Avatar de usuario" />
                <AvatarFallback>{user.email ? user.email.slice(0, 2).toUpperCase() : 'US'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login" passHref>
            <Button variant="outline">
              <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
            </Button>
          </Link>
          <Link href="/register" passHref>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Registrarse
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
