'use client'
import { useEffect } from 'react'

/**
 * Registers the <lord-icon> custom element once on the client.
 * Must be rendered inside the app layout.
 */
export function LordinIconProvider() {
  useEffect(() => {
    import('@lordicon/element').then(({ defineElement }) => {
      defineElement()
    })
  }, [])

  return null
}
