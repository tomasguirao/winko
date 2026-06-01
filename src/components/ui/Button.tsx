import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = true,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full font-bold text-base py-4 px-8 transition-all duration-200 active:scale-95',
        fullWidth && 'w-full',
        variant === 'primary' && 'bg-yellow-400 text-black hover:bg-yellow-300',
        variant === 'secondary' && 'bg-white/10 text-white hover:bg-white/20',
        variant === 'ghost' && 'bg-transparent text-white/60 hover:text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
