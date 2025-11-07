"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { updatePassword } from "./actions";


const formSchema = z.object({
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSessionReady, setIsSessionReady] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user.aud === "authenticated") {
        // This event fires when the user arrives from a password recovery link.
        // The session is temporarily authenticated to allow the password update.
        setIsSessionReady(true);
      }
    });

    // Also check if there's already a session on mount (though less likely for this page)
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setIsSessionReady(true);
        }
    };
    checkSession();


    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase.auth]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
     if (!isSessionReady) {
      toast({
        variant: "destructive",
        title: "Error de Sesión",
        description: "Tu sesión de recuperación ha expirado o es inválida. Por favor, solicita un nuevo enlace.",
      });
      return;
    }
    
    const result = await updatePassword(values.password);

    if (result.success) {
      toast({
        title: "Contraseña Actualizada",
        description: "Tu contraseña ha sido cambiada con éxito. Ya puedes iniciar sesión.",
      });
      await supabase.auth.signOut();
      router.push("/login");
    } else {
       toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: result.message,
      });
    }
  }

  if (!isSessionReady) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12 pt-32">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Verificando sesión...</CardTitle>
            <CardDescription>
              Aguarde mientras validamos su enlace de recuperación.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12 pt-32">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Establecer Nueva Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña a continuación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Actualizando...' : <><KeyRound className="mr-2 h-4 w-4" /> Actualizar Contraseña</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
