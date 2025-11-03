'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

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
import { signUp } from '@/lib/functions/log/singUp';
import { methodPost } from '@/lib/functions/metodos/methodPost';

// --- Esquema de validación para el formulario de nuevo usuario ---
const newUserSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  email: z.string().email('Debe ser un correo electrónico válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  role: z.enum(['Admin', 'Vendedor'], {
    required_error: 'El rol es obligatorio.',
  }),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

export default function NewUserPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'Vendedor',
    },
  });

  // --- Función para enviar el formulario ---
  async function onSubmit(data: NewUserFormValues) {
    // 1. Crear el usuario en Supabase Auth
    const signUpResult = await signUp(data.email, data.password, {
      data: { name: data.name },
    });

    if (!signUpResult.success || !signUpResult.data?.id) {
      toast({
        title: 'Error al crear usuario en Auth',
        description: signUpResult.message,
        variant: 'destructive',
      });
      return;
    }

    // 2. Crear el registro en la tabla 'user'
    const userPayload = {
      id: signUpResult.data.id,
      name: data.name,
      role: data.role,
      email: data.email,
    };

    const userTableResult = await methodPost(userPayload, 'user');

    if (!userTableResult.success) {
      toast({
        title: 'Error al guardar en tabla de usuarios',
        description: `El usuario de autenticación se creó, pero no se pudo guardar su rol. Por favor, edítalo manualmente. ${userTableResult.message}`,
        variant: 'destructive',
      });
      // Aún si esto falla, redirigimos porque el usuario existe en Auth.
      router.push('/usuarios');
      return;
    }

    toast({
      title: 'Usuario Creado',
      description: 'El nuevo usuario ha sido creado con éxito.',
    });

    router.push('/usuarios');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto grid max-w-2xl flex-1 auto-rows-max gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Usuario</CardTitle>
              <CardDescription>
                Ingresa los detalles para el nuevo miembro del equipo.
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
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
                        defaultValue={field.value}
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
                  ? 'Creando...'
                  : 'Crear Usuario'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
}
