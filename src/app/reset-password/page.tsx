"use client";

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
import { emailPassword } from "@/lib/functions/log/emailPassword.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail } from "lucide-react";

// ✅ Validación con Zod
const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Por favor, introduce una dirección de correo válida." }),
});

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();

  // ✅ Configuración del formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const { isSubmitting } = form.formState;

  // ✅ Manejo del envío del formulario
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("📤 Enviando solicitud de recuperación para:", values.email);

    const result = await emailPassword(values.email);
    console.log("📨 Resultado de emailPassword:", result);

    if (result.success) {
      toast({
        title: "Correo Enviado",
        description:
          "Si la cuenta existe, se ha enviado un correo con instrucciones para restablecer la contraseña.",
      });

      // ✅ Pausa breve para que el usuario lea el toast
      setTimeout(() => router.push("/login"), 2000);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12 pt-32">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Restablecer Contraseña
          </CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico para recibir un enlace de recuperación.
          </CardDescription>
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
                      <Input
                        type="email"
                        placeholder="tu.correo@ejemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" /> Enviar correo
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
