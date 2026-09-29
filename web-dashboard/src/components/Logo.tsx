import Image from 'next/image';
import { clsx } from 'clsx';

interface LogoProps {
  variant?: 'color' | 'white' | 'mono';
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
  dark?: boolean;
  className?: string;
}

/** Logo Jejak — memakai aset yang sama dengan mobile (public/logo-*.svg). */
export default function Logo({
  variant = 'color',
  size = 36,
  showWordmark = true,
  subtitle,
  dark = false,
  className,
}: LogoProps) {
  if (variant === 'mono') {
    return (
      <span className={clsx('inline-flex items-center gap-2.5', className)}>
        <span
          className="flex items-center justify-center bg-emerald-600 font-extrabold text-white"
          style={{ width: size, height: size, borderRadius: size * 0.28, fontSize: size * 0.5 }}
        >
          ▲
        </span>
        {showWordmark && (
          <span className="leading-tight">
            <span className={clsx('block text-xl font-extrabold tracking-tight', dark ? 'text-white' : 'text-gray-900')}>Jejak</span>
            {subtitle && <span className="block text-xs text-gray-500">{subtitle}</span>}
          </span>
        )}
      </span>
    );
  }
  const src = variant === 'white' ? '/logo-white.svg' : '/logo-color.svg';
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <Image
        src={src}
        alt="Logo Jejak"
        width={size}
        height={size}
        className="object-cover"
        style={{ borderRadius: size * 0.24 }}
        priority
      />
      {showWordmark && (
        <span className="leading-tight">
          <span className={clsx('block text-xl font-extrabold tracking-tight', dark || variant === 'white' ? 'text-white' : 'text-gray-900')}>Jejak</span>
          {subtitle && <span className={clsx('block text-xs', dark ? 'text-gray-300' : 'text-gray-500')}>{subtitle}</span>}
        </span>
      )}
    </span>
  );
}
