'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { methodGetById } from '@/lib/functions/metodos/methodGetById';
import { methodPut } from '@/lib/functions/metodos/methodPut';
import type { User } from '@/lib/types';

// --- Esquema de validación para el formulario de usuario ---
const userSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  role: z.enum(['Admin', 'Vendedor'], {
    required_error: 'El rol es obligatorio.',
  }),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const userId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      role: 'Vendedor',
    },
  });

  // --- Cargar datos del usuario al montar el componente ---
  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        setIsLoading(true);
        const result = await methodGetById('user', userId);

        if (result.success && result.data) {
          form.reset({
            name: result.data.name || '',
            role: result.data.role || 'Vendedor',
          });
        } else {
          toast({
            title: 'Error',
            description: 'No se pudo encontrar el usuario.',
            variant: 'destructive',
          });
          router.push('/usuarios');
        }
        setIsLoading(false);
      };
      fetchUserData();
    }
  }, [userId, form, router, toast]);

  // --- Función para enviar el formulario ---
  async function onSubmit(data: UserFormValues) {
    const payload = { ...data, id: userId };
    const resp = await methodPut('user', payload);

    toast({
      title: resp.success ? 'Usuario Actualizado' : 'Error',
      description: resp.message,
      variant: resp.success ? 'default' : 'destructive',
    });

    if (resp.success) {
      router.push('/usuarios');
      router.refresh(); // Opcional: para forzar la recarga de datos en la tabla
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Cargando datos del usuario...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto grid max-w-2xl flex-1 auto-rows-max gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Editar Usuario</CardTitle>
              <CardDescription>
                Modifica el nombre y el rol del usuario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Vendedor">Vendedor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/usuarios">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Guardando...'
                  : 'Actualizar Usuario'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}
