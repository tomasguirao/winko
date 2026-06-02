import Image from 'next/image';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center px-6 py-8 max-w-md mx-auto w-full">
      {/* Logo header */}
      <div className="flex justify-center mb-6">
        <Image src="/logo.PNG" alt="Winko" width={288} height={106} className="object-contain" priority />
      </div>
      {children}
    </div>
  );
}
