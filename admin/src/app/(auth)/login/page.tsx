'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Por favor, insira um email válido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setGeneralError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setGeneralError('Email ou senha incorretos');
        } else {
          setGeneralError(result.error);
        }
      } else {
        toast.success('Login realizado com sucesso!');
        router.push(callbackUrl);
      }
    } catch {
      setGeneralError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large circle top-right */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
          {/* Medium circle bottom-left */}
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full" />
          {/* Small circle top-left */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          {/* Medium circle center-right */}
          <div className="absolute top-1/2 -right-16 w-64 h-64 bg-white/5 rounded-full" />
          {/* Decorative dots pattern */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full" />
          <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-white/15 rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-white/25 rounded-full" />
          <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-white/10 rounded-full" />
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="max-w-md text-white relative z-10">
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="EloSaúde"
              width={180}
              height={45}
              className="h-12 w-auto brightness-0 invert"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Painel Administrativo
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Gerencie beneficiários, planos, reembolsos e muito mais em uma única plataforma integrada.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm text-white/70">Beneficiários ativos</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-white/70">Disponibilidade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="EloSaúde"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse o painel administrativo com suas credenciais
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* General Error */}
            {generalError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{generalError}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-muted-foreground'}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@elosaude.com.br"
                  {...register('email')}
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border transition-colors bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-muted-foreground'}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  {...register('password')}
                  className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border transition-colors bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-border focus:border-primary focus:ring-primary/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-xs text-muted-foreground">
              EloSaúde &copy; {new Date().getFullYear()}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
