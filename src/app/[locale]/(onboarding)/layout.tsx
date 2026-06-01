export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto">
      {children}
    </div>
  );
}
