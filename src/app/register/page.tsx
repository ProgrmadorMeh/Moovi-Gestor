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
import { signUp } from "@/lib/functions/log/singUp.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, introduce una dirección de correo válida.",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres.",
  }),
});

export default function RegisterPage() {
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
    const result = await signUp(values.email, values.password);

    if (result.success) {
      toast({
        title: "¡Registro exitoso!",
        description: result.message,
      });
       // Refresh the current route and let the middleware handle the redirect.
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error en el registro",
        description: result.message,
      });
    }
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12 pt-32">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Crear una Cuenta</CardTitle>
                <CardDescription>Regístrate para obtener acceso.</CardDescription>
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
                            {isSubmitting ? 'Registrando...' : <><UserPlus className="mr-2 h-4 w-4" /> Registrarse</>}
                        </Button>
                    </form>
                </Form>
                <div className="mt-6 text-center text-sm">
                    <p className="text-muted-foreground">
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/login" className="font-medium text-primary hover:underline">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
