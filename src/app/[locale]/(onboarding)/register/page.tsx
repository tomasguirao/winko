'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { User, Eye, EyeOff, Calendar, Lock } from 'lucide-react';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

function formatDob(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

function isAdult(dob: string): boolean {
  if (dob.length < 10) return false;
  const [day, month, year] = dob.split('/').map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear() -
    (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  return age >= 18;
}

function dobToISO(dob: string): string {
  const [day, month, year] = dob.split('/');
  return `${year}-${month}-${day}`;
}

export default function RegisterPage() {
  const t = useTranslations('onboarding.register');
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({ email: '', password: '', dob: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password || !form.dob) return;
    if (!isAdult(form.dob)) {
      setError('Debes tener 18 años o más para registrarte.');
      return;
    }
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { date_of_birth: dobToISO(form.dob) },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Guardar para los siguientes pasos del onboarding
    sessionStorage.setItem('register_data', JSON.stringify({
      email: form.email,
      dob: form.dob,
      user_id: data.user?.id,
    }));

    // Guardar consentimientos
    const consents = JSON.parse(sessionStorage.getItem('consent_adults_only') || '{}');
    if (data.user) {
      await supabase.from('consents').insert({
        user_id: data.user.id,
        consent_adults_only: consents.age ?? true,
        consent_content: consents.content ?? true,
        consent_terms: consents.terms ?? true,
        consent_privacy: consents.privacy ?? true,
        terms_version: consents.terms_version ?? 'v1.0',
        privacy_version: consents.privacy_version ?? 'v1.0',
        ip_address: null,
      });
    }

    router.push('./verify-email');
    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <ProgressBar current={2} total={8} />

      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
        <User className="w-10 h-10 text-yellow-400" />
      </div>

      <h1 className="text-2xl font-black text-white mb-8 text-center">{t('title')}</h1>

      <div className="w-full flex flex-col gap-4 mb-6">
        <div>
          <label className="text-white/60 text-sm mb-1.5 block">{t('email')}</label>
          <input
            type="email"
            placeholder={t('emailPlaceholder')}
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-white/60 text-sm mb-1.5 block">{t('password')}</label>
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

        <div>
          <label className="text-white/60 text-sm mb-1.5 block">{t('dob')}</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="DD / MM / YYYY"
              value={form.dob}
              onChange={e => setForm(p => ({ ...p, dob: formatDob(e.target.value) }))}
              maxLength={10}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50 transition-colors pr-12"
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
          </div>
        </div>

        <div className="flex items-start gap-2 bg-white/5 rounded-xl p-3">
          <Lock className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
          <p className="text-white/40 text-xs leading-relaxed">{t('ageWarning')}</p>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      <Button onClick={handleSubmit} disabled={loading || !form.email || !form.password || form.dob.length < 10}>
        {loading ? 'Creando cuenta...' : t('button')}
      </Button>
    </div>
  );
}
