import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        trigger?: 'hover' | 'click' | 'loop' | 'loop-on-hover' | 'boomerang' | 'morph' | 'sequence' | 'in'
        colors?: string
        stroke?: 'light' | 'regular' | 'bold'
        state?: string
        target?: string
        speed?: string
        loading?: 'lazy' | 'interaction' | 'delay'
      }
    }
  }
}
