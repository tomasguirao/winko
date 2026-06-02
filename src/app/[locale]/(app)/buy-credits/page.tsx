'use client';

import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Zap, TrendingDown, TrendingUp, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { useCredits } from '@/lib/supabase/hooks';

type Package = { id: string; name: string; credits: number; price_cents: number; is_popular: boolean };
type Transaction = { id: string; type: string; amount: number; description: string; created_at: string };

export default function BuyCreditsPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const credits = useCredits();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: pkgs }, { data: txs }] = await Promise.all([
        supabase.from('credit_packages').select('*').eq('is_active', true).order('sort_order'),
        user ? supabase.from('credit_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20) : Promise.resolve({ data: [] }),
      ]);
      setPackages(pkgs ?? []);
      setHistory((txs as Transaction[]) ?? []);
    }
    load();
  }, []);

  const handleBuy = async () => {
    if (!selected) return;
    setBuying(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setBuying(false); return; }
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ package_id: selected }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setBuying(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto">
      <AppHeader credits={credits} />
      <div className="flex-1 overflow-y-auto px-4 pb-28">

        <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 border border-yellow-400/30 rounded-2xl p-6 mb-6 text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-3">
            <span className="text-black font-black text-lg">C</span>
          </div>
          <p className="text-white/60 text-sm mb-1">Tu saldo actual</p>
          <p className="text-5xl font-black text-yellow-400">{credits}</p>
          <p className="text-white/40 text-xs mt-1">créditos</p>
        </div>

        <p className="text-white font-bold text-base mb-3">Comprar créditos</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {packages.map(pkg => (
            <button key={pkg.id} onClick={() => setSelected(pkg.id)}
              className={cn('relative rounded-2xl border-2 p-4 text-left transition-all',
                selected === pkg.id ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/10 bg-[#111]')}>
              {pkg.is_popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">POPULAR</div>
              )}
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-black text-2xl">{pkg.credits}</span>
              </div>
              <p className="text-white/40 text-xs mb-2">créditos</p>
              <p className="text-white font-black text-lg">{(pkg.price_cents / 100).toFixed(2)}€</p>
            </button>
          ))}
        </div>

        <button onClick={handleBuy} disabled={!selected || buying}
          className={cn('w-full font-black text-lg rounded-2xl py-4 flex items-center justify-center gap-2 transition-all mb-8',
            selected && !buying ? 'bg-yellow-400 text-black active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed')}>
          <Plus className="w-5 h-5" />
          {buying ? 'Procesando...' : 'Comprar ahora'}
        </button>

        {history.length > 0 && (
          <>
            <p className="text-white font-bold text-base mb-3">Historial</p>
            <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
              {history.map((item, i) => (
                <div key={item.id}>
                  {i > 0 && <div className="h-px bg-white/5 mx-4" />}
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', item.amount > 0 ? 'bg-green-400/10' : 'bg-red-400/10')}>
                      {item.amount > 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.description}</p>
                      <p className="text-white/30 text-xs">{new Date(item.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                    <p className={cn('font-black', item.amount > 0 ? 'text-green-400' : 'text-red-400')}>
                      {item.amount > 0 ? '+' : ''}{item.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
