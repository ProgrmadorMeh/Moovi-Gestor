"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginWithEmail } from "@/lib/functions/log/singIn.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, introduce una dirección de correo válida.",
  }),
  password: z.string().min(1, {
    message: "La contraseña no puede estar vacía.",
  }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await loginWithEmail(values.email, values.password);

    if (result.success) {
      toast({
        title: "¡Bienvenido de vuelta!",
        description: "Has iniciado sesión correctamente.",
      });
      // SOLUCIÓN: Usamos router.push() para una redirección explícita e inmediata.
      // Esto es más robusto que router.refresh() y evita problemas de caché/timing.
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: result.message,
      });
    }
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12 pt-32">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Iniciar Sesión</CardTitle>
                <CardDescription>Accede a tu cuenta para continuar.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="tu.correo@ejemplo.com" {...field} />
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
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Iniciando...' : <><LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión</>}
                        </Button>
                    </form>
                </Form>
                <div className="mt-6 text-center text-sm">
                    <p className="text-muted-foreground">
                        ¿No tienes una cuenta?{" "}
                        <Link href="/register" className="font-medium text-primary hover:underline">
                            Regístrate aquí
                        </Link>
                    </p>
                    <p className="text-muted-foreground mt-2">
                        <Link href="/reset-password" passHref className="font-medium text-primary hover:underline">
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
