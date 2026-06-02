'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string ?? 'es';
  const supabase = createClient();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      setError('Email o contraseña incorrectos.');
      setLoading(false);
      return;
    }
    router.push(`/${locale}/feed`);
  };

  const handleForgot = async () => {
    if (!form.email) { setError('Introduce tu email primero.'); return; }
    await supabase.auth.resetPasswordForEmail(form.email);
    setError('Te hemos enviado un email para restablecer tu contraseña.');
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col gap-4 mb-6 mt-4">
        <div>
          <label className="text-white/60 text-sm mb-1.5 block">Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-white/60 text-sm mb-1.5 block">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50 transition-colors pr-12"
            />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button onClick={handleForgot} className="text-yellow-400 text-sm text-right underline underline-offset-2">
          ¿Olvidaste tu contraseña?
        </button>

        {error && <p className={`text-sm text-center ${error.includes('enviado') ? 'text-green-400' : 'text-red-400'}`}>{error}</p>}
      </div>

      <Button onClick={handleLogin} disabled={loading || !form.email || !form.password}>
        {loading ? 'Entrando...' : 'Iniciar sesión'}
      </Button>

      <div className="flex items-center gap-2 mt-6">
        <span className="text-white/40 text-sm">¿No tienes cuenta?</span>
        <button onClick={() => router.push(`/${locale}/adults-only`)} className="text-yellow-400 text-sm underline underline-offset-2">
          Regístrate
        </button>
      </div>
    </div>
  );
}
