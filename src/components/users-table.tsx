'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

import type { User } from '@/lib/types';

interface UsersTableProps {
  initialUsers: User[];
  onUserDeleted: () => void;
}

export function UsersTable({ initialUsers, onUserDeleted }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleDeleteUser = async (userToDelete: User) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar al usuario ${userToDelete.email}?`
    );
    if (!confirmar) return;

    try {
      const res = await fetch('/api/deleteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToDelete.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');

      alert('Usuario eliminado correctamente ✅');
      onUserDeleted(); // Llama a la función para refrescar la lista
    } catch (err) {
      console.error('Error:', err);
      alert('Hubo un error al eliminar el usuario ❌');
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="hidden md:table-cell">Último Acceso</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.avatarUrl?.trim() || 'https://pwxpxouatzzxvvvszdnx.supabase.co/storage/v1/object/public/userImage/userDefault.jpg'}
                        alt={`Avatar de ${user.name || user.email}`}
                      />
                      <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <div className="font-medium">{user.name || user.email}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                   {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Nunca'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() => handleDeleteUser(user)}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Mostrando <strong>1-{users.length}</strong> de{' '}
          <strong>{users.length}</strong> usuarios
        </div>
      </CardFooter>
    </Card>
  );
}
