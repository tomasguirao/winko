import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const navItems = [
  { href: 'dashboard',  label: 'Dashboard',   icon: '📊' },
  { href: 'moderation', label: 'Moderation',  icon: '🛡️' },
  { href: 'users',      label: 'Users',        icon: '👥' },
  { href: 'reports',    label: 'Reports',      icon: '🚨' },
  { href: 'comments',   label: 'Comments',     icon: '💬' },
  { href: 'credits',    label: 'Credits',      icon: '💳' },
  { href: 'stats',      label: 'Statistics',   icon: '📈' },
  { href: 'legal',      label: 'Legal Docs',   icon: '📄' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#111] border-r border-white/5 flex flex-col fixed h-full z-10">
        <div className="px-4 py-5 border-b border-white/5">
          <Image src="/logo.PNG" alt="Winko" width={90} height={32} className="object-contain" />
          <span className="text-yellow-400 text-xs font-bold mt-1 block">Admin Panel</span>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={`./admin/${item.href}`}
              className="flex items-center gap-3 px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <p className="text-white/20 text-xs">Winko Admin v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
