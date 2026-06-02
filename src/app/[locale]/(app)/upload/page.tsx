'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Upload, AlertTriangle, Shield, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { useCredits } from '@/lib/supabase/hooks';
import type { Category } from '@/types';

const categories: { value: Category; label: string }[] = [
  { value: 'body',     label: 'Body' },
  { value: 'chest',   label: 'Chest' },
  { value: 'back',    label: 'Back' },
  { value: 'butt',    label: 'Butt' },
  { value: 'intimate',label: 'Intimate' },
];

const declarations = [
  'I own this image',
  'No faces are visible',
];

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const credits = useCredits();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('body');
  const [visibility, setVisibility] = useState<'global' | 'country' | '100km' | '20km'>('global');
  const [checks, setChecks] = useState([false, false]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const allChecked = checks.every(Boolean);
  const canPublish = photo && allChecked && !uploading;

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    setPhoto(URL.createObjectURL(f));
  };

  const handlePublish = async () => {
    if (!file || !canPublish) return;
    setUploading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Upload to Storage
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      // Call edge function
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ storage_path: path, category, visibility }),
      });

      router.push('my-photos');
    } catch (e: any) {
      setError(e.message ?? 'Error al subir la foto');
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div className="h-screen bg-black flex flex-col max-w-md mx-auto overflow-hidden">

      {/* Header */}
      <div className="relative flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
          <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-black text-xs font-black">C</span>
          </div>
          <span className="text-white font-bold text-sm">{credits}</span>
          <Plus className="w-3.5 h-3.5 text-white/60" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 mt-[3px]">
          <Image src="/logo.PNG" alt="Winko" width={140} height={52} className="object-contain" priority />
        </div>
        <button className="text-2xl">🔥</button>
      </div>

      {/* Privacy badges */}
      <div className="flex items-center justify-center gap-6 px-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-semibold">100% Anonymous</span>
        </div>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-1.5">
          <XCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-xs font-semibold uppercase">No Faces Allowed</span>
        </div>
      </div>

      {/* Upload area — flex-1 para ocupar todo el espacio sobrante */}
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={cn(
          'flex-1 mx-4 rounded-3xl border-2 border-dashed cursor-pointer transition-all overflow-hidden min-h-0',
          dragging ? 'border-yellow-400 bg-yellow-400/5' : 'border-yellow-400/40 bg-white/5',
        )}
      >
        {photo ? (
          <>
            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={e => { e.stopPropagation(); setPhoto(null); }}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
            >✕</button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="relative">
              <svg viewBox="0 0 60 60" fill="none" stroke="#F5C000" strokeWidth={2.5} className="w-14 h-14">
                <rect x="4" y="12" width="44" height="36" rx="4" />
                <circle cx="18" cy="26" r="4" />
                <path d="M4 36 l12-10 8 8 8-6 16 12" strokeLinejoin="round" />
              </svg>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-black" strokeWidth={3} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-black text-lg mb-1">Add Photo</p>
              <p className="text-white/40 text-sm">Tap to choose a photo or drag it here</p>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400/70" />
              <p className="text-white/40 text-xs">Photos showing faces will be rejected.</p>
            </div>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      {/* Category */}
      <div className="px-4 pt-3 flex-shrink-0">
        <p className="text-white font-bold text-sm mb-2">Category</p>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                'rounded-full border-2 py-1.5 px-4 text-sm font-semibold transition-all',
                category === cat.value
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-white/10 bg-white/5 text-white/50'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom — declarations + publish + nav */}
      <div className="flex-shrink-0 px-4 pt-3 pb-6 border-t border-white/5 mt-3">

        {/* Declarations */}
        <div className="flex flex-col gap-3 mb-3">
          {declarations.map((text, i) => (
            <button key={i} onClick={() => setChecks(prev => prev.map((v, idx) => idx === i ? !v : v))} className="flex items-center gap-3 text-left">
              <div className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                checks[i] ? 'bg-yellow-400 border-yellow-400' : 'border-white/30'
              )}>
                {checks[i] && (
                  <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-white/80 text-sm font-medium">{text}</span>
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}

        {/* Publish */}
        <button
          onClick={handlePublish}
          disabled={!canPublish}
          className={cn(
            'w-full font-black text-lg rounded-2xl py-3.5 flex items-center justify-center gap-3 transition-all mb-3',
            canPublish ? 'bg-yellow-400 text-black active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed'
          )}
        >
          <Upload className="w-5 h-5" />
          {uploading ? 'Subiendo...' : 'Publish Photo'}
        </button>

        {/* Nav */}
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1">
            <Upload className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 text-xs font-semibold">Upload</span>
          </button>
          <button onClick={() => router.push('../feed')} className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center -mt-4 shadow-lg shadow-yellow-400/30">
            <Image src="/logo-icon.PNG" alt="Winko" width={36} height={36} className="object-contain" />
          </button>
          <button onClick={() => router.push('../profile')} className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/50">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-white/40 text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
