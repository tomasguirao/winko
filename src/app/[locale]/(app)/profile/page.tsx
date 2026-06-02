'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, ChevronRight, BarChart2, Bell, ImageIcon, Trash2, User, Lock, Shield, Eye, Cookie, HelpCircle } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';

const MOCK_USER = {
  nickname: 'Nova7421',
  handle: '@nova7421',
  verified: true,
  winkos: 24,
  votes: 1200,
  comments: 342,
  credits: 120,
};

const MenuItem = ({ icon: Icon, label, description, onClick, danger = false }: {
  icon: React.ElementType; label: string; description?: string; onClick?: () => void; danger?: boolean;
}) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/5 transition-colors text-left active:bg-white/10">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-500/10' : 'bg-yellow-400/10'}`}>
      <Icon className={`w-4 h-4 ${danger ? 'text-red-400' : 'text-yellow-400'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-semibold text-sm ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
      {description && <p className="text-white/40 text-xs mt-0.5">{description}</p>}
    </div>
    <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
  </button>
);

const SectionLabel = ({ label }: { label: string }) => (
  <p className="text-white/30 text-xs font-bold uppercase tracking-wider px-4 pt-4 pb-1">{label}</p>
);
const Divider = () => <div className="h-px bg-white/5 mx-4" />;

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto">

      {/* Header */}
      <div className="relative flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <div
          onClick={() => router.push('buy-credits')}
          className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 cursor-pointer active:bg-white/20"
        >
          <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-black text-xs font-black">C</span>
          </div>
          <span className="text-white font-bold text-sm">{MOCK_USER.credits}</span>
          <Plus className="w-3.5 h-3.5 text-white/60" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 mt-[3px]">
          <Image src="/logo.PNG" alt="Winko" width={140} height={52} className="object-contain" priority />
        </div>
        <button className="text-2xl">🔥</button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28">

        {/* Profile card */}
        <div className="mx-4 mt-2 bg-[#111] border border-white/8 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-yellow-400 overflow-hidden bg-white/5">
                <div className="w-full h-full bg-gradient-to-b from-yellow-400/20 to-black flex items-center justify-center">
                  <User className="w-8 h-8 text-yellow-400/50" />
                </div>
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-black" strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-white font-black text-lg">{MOCK_USER.nickname}</p>
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="black" className="w-3 h-3">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-white/40 text-sm mb-3">{MOCK_USER.handle}</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-white font-black text-base leading-none">{MOCK_USER.winkos}</p>
                  <p className="text-white/40 text-xs mt-0.5">Winkos</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-white font-black text-base leading-none">{(MOCK_USER.votes / 1000).toFixed(1)}K</p>
                  <p className="text-white/40 text-xs mt-0.5">Votos recibidos</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-white font-black text-base leading-none">{MOCK_USER.comments}</p>
                  <p className="text-white/40 text-xs mt-0.5">Comentarios</p>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20 flex-shrink-0" />
          </div>
        </div>

        {/* Menu */}
        <div className="mx-4 mt-4 bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          <MenuItem icon={BarChart2} label="Results" description="Consulta el rendimiento de tus publicaciones y votos." onClick={() => router.push('my-photos')} />
          <Divider />
          <MenuItem icon={Bell} label="Alerts" description="Gestiona tus notificaciones y alertas." onClick={() => router.push('alerts')} />

          <SectionLabel label="Gestión de contenido" />
          <Divider />
          <MenuItem icon={ImageIcon} label="Mis fotos subidas" description="Ver, gestionar o eliminar tus fotos." onClick={() => router.push('my-photos')} />
          <Divider />
          <MenuItem icon={Trash2} label="Eliminar fotos subidas" description="Elimina fotos que hayas publicado." onClick={() => router.push('my-photos')} danger />

          <SectionLabel label="Cuenta" />
          <Divider />
          <MenuItem icon={User} label="Editar perfil" description="Actualiza tu información personal." onClick={() => {}} />
          <Divider />
          <MenuItem icon={Lock} label="Cambiar contraseña" description="Mantén tu cuenta segura." onClick={() => {}} />
          <Divider />
          <MenuItem icon={Trash2} label="Eliminar cuenta" description="Elimina tu cuenta y todos tus datos permanentemente." onClick={() => {}} danger />

          <SectionLabel label="Legal" />
          <Divider />
          <MenuItem icon={Shield} label="Términos de uso" onClick={() => {}} />
          <Divider />
          <MenuItem icon={Eye} label="Política de privacidad" onClick={() => {}} />
          <Divider />
          <MenuItem icon={Cookie} label="Política de cookies" onClick={() => {}} />
          <Divider />
          <MenuItem icon={HelpCircle} label="Centro de ayuda" onClick={() => {}} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
