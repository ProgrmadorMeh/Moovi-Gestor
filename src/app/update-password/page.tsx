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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const formSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSessionReady, setIsSessionReady] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkRecovery = async () => {
      console.log("🔍 Iniciando verificación de enlace de recuperación...");

      // 🔹 Forzar lectura del hash (Supabase moderno)
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      // 🔹 También leer ?code= (Supabase legacy)
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      console.log("🧭 Query code:", code);
      console.log("🔐 Hash access_token:", access_token);
      console.log("🔁 Refresh token:", refresh_token);
      console.log("📦 Tipo:", type);

      try {
        if (access_token && refresh_token && type === "recovery") {
          console.log("⚙️ Configurando sesión con access_token (hash)...");
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
          console.log("✅ Sesión configurada correctamente:", data);
          setIsSessionReady(true);
        } else if (code) {
          console.log("📨 Intercambiando code por sesión...");
          // 🔹 Si recibís ?code= en lugar de hash, reemplazá la URL y forzá el hash
          window.location.replace(
            `${window.location.origin}/update-password#type=recovery`
          );
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          console.log("✅ Sesión creada con code:", data);
          setIsSessionReady(true);
        } else {
          console.warn("⚠️ No se encontró ni code ni access_token válido");
          setIsSessionReady(false);
        }
      } catch (err) {
        console.error("🔥 Error al configurar sesión:", err);
        setIsSessionReady(false);
      } finally {
        setLoading(false);
      }
    };

    checkRecovery();
  }, [supabase]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("💾 Intentando actualizar contraseña...");
    if (!isSessionReady) {
      toast({
        variant: "destructive",
        title: "Error de Sesión",
        description:
          "Tu enlace de recuperación ha expirado o es inválido. Solicita uno nuevo.",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      console.error("❌ Error al actualizar contraseña:", error);
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: `No se pudo actualizar la contraseña. Error: ${error.message}`,
      });
    } else {
      console.log("✅ Contraseña actualizada correctamente");
      toast({
        title: "Contraseña actualizada",
        description: "Ahora puedes iniciar sesión con tu nueva contraseña.",
      });
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12 pt-32">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Verificando enlace...
            </CardTitle>
            <CardDescription>
              Aguarda mientras validamos tu enlace de recuperación.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isSessionReady) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12 pt-32">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Enlace Inválido o Expirado
            </CardTitle>
            <CardDescription>
              El enlace de recuperación es inválido o ha expirado. Solicita uno
              nuevo.
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
          <CardTitle className="text-2xl font-bold tracking-tight">
            Establecer Nueva Contraseña
          </CardTitle>
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
                {isSubmitting ? (
                  "Actualizando..."
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" /> Actualizar Contraseña
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
