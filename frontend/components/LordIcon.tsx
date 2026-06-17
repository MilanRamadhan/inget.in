'use client'
import { useEffect, useState } from 'react'

interface LordIconProps {
  src: string
  trigger?: 'hover' | 'click' | 'loop' | 'loop-on-hover' | 'boomerang' | 'morph' | 'sequence' | 'in'
  colors?: string
  stroke?: 'light' | 'regular' | 'bold'
  state?: string
  /** CSS selector of the element that receives trigger events (e.g. ".note-card") */
  target?: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Renders a Lordicon animated icon.
 * Only renders client-side to avoid SSR mismatch with custom element.
 */
export function LordIcon({
  src,
  trigger = 'hover',
  colors,
  stroke,
  state,
  target,
  size = 28,
  className,
  style,
}: LordIconProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return <span style={{ display: 'inline-block', width: size, height: size }} />
  }

  return (
    <lord-icon
      src={src}
      trigger={trigger}
      colors={colors}
      stroke={stroke}
      state={state}
      target={target}
      style={{ width: size, height: size, display: 'inline-block', ...style }}
      className={className}
    />
  )
}
