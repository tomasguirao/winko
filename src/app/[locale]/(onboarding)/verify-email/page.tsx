'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Mail, RefreshCw, Loader2 } from 'lucide-react';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function VerifyEmailPage() {
  const t = useTranslations('onboarding.verifyEmail');
  const router = useRouter();
  const supabase = createClient();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const email = typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('register_data') || '{}').email || 'tu@email.com'
    : 'tu@email.com';

  const handleVerified = async () => {
    setChecking(true);
    setError('');

    // Forzar refresh de sesión para obtener el estado más reciente
    await supabase.auth.refreshSession();

    const { data: { user } } = await supabase.auth.getUser();

    if (user?.email_confirmed_at) {
      router.push('./about-you');
      return;
    }

    // Segundo intento — a veces el token tarda en propagarse
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email_confirmed_at) {
      router.push('./about-you');
      return;
    }

    // Sin sesión — verificó en otro dispositivo, necesita hacer login
    if (!session) {
      setError('Verificaste el email en otro dispositivo. Inicia sesión para continuar.');
      setChecking(false);
      setShowLogin(true);
      return;
    }

    setError('Tu email aún no está verificado. Abre el enlace del email y luego vuelve aquí.');
    setChecking(false);
  };

  const handleResend = async () => {
    await supabase.auth.resend({ type: 'signup', email });
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  const handleLoginAndContinue = async () => {
    setLoggingIn(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: loginPassword,
    });
    if (loginError) {
      setError('Contraseña incorrecta. Inténtalo de nuevo.');
      setLoggingIn(false);
      return;
    }
    router.push('./about-you');
  };

  return (
    <div className="w-full flex flex-col items-center">
      <ProgressBar current={3} total={8} />

      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6 relative">
        <Mail className="w-10 h-10 text-yellow-400" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-black text-white mb-4 text-center">{t('title')}</h1>
      <p className="text-white/50 text-sm text-center mb-4">{t('subtitle')}</p>

      <div className="bg-white/10 rounded-xl px-6 py-3 mb-4">
        <p className="text-white font-medium text-sm">{email}</p>
      </div>

      <p className="text-white/40 text-sm text-center mb-6">{t('instructions')}</p>

      {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

      {/* Login inline si verificó en otro dispositivo */}
      {showLogin ? (
        <div className="w-full flex flex-col gap-3 mb-4">
          <p className="text-white/60 text-xs text-center">Introduce tu contraseña para continuar</p>
          <input
            type="password"
            placeholder="Tu contraseña"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50"
          />
          <Button onClick={handleLoginAndContinue} disabled={loggingIn || !loginPassword}>
            {loggingIn ? 'Entrando...' : 'Entrar y continuar →'}
          </Button>
        </div>
      ) : (
        <>
          <button
            onClick={handleResend}
            className="flex items-center gap-2 text-white/60 text-sm mb-6 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {resent ? '✓ Email reenviado' : t('resend')}
          </button>

          <Button onClick={handleVerified} disabled={checking}>
            {checking ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Comprobando...
              </span>
            ) : t('button')}
          </Button>
        </>
      )}
    </div>
  );
}
