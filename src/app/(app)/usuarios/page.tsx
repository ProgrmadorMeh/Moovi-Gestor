'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUsers } from '@/lib/data';
import { UsersTable } from '@/components/users-table';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/types';
import { ExportExcelButton } from '@/components/forms/exel/exel-button';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const initialUsers = await getUsers(true); // Forzar refresh
    setUsers(initialUsers);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex-1">
          Administración de Usuarios
        </h2>
        <div className="flex items-center gap-2">
          <ExportExcelButton
            data={users}
            fileName="usuarios"
            sheetName="Usuarios"
          />
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" /> Nuevo Usuario
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <UsersTable initialUsers={users} onUserDeleted={fetchUsers} />
      )}
    </div>
  );
}
