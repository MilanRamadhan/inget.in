import Image from 'next/image'

interface LogoProps {
  size?: number
  withText?: boolean
  className?: string
}

/** App logo: the icon (public/logo.png) + the "inget.in" wordmark. */
export function Logo({ size = 30, withText = true, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="inget.in"
        width={size}
        height={size}
        priority
        className="rounded-[7px]"
      />
      {withText && (
        <span className="text-lg font-bold text-primary tracking-tight">inget.in</span>
      )}
    </span>
  )
}
