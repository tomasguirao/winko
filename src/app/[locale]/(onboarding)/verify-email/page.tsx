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

    // Si verificó en otra pestaña, puede que necesite hacer login de nuevo
    if (!session) {
      setError('Sesión expirada. Por favor, inicia sesión con tu email y contraseña.');
      setChecking(false);
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
    </div>
  );
}
