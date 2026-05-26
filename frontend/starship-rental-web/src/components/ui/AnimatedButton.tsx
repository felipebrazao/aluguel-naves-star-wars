import { motion } from 'framer-motion'
import type { ElementType, ReactNode } from 'react'

interface AnimatedButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  as?: ElementType
  to?: string
}

const variantStyles = {
  primary: 'bg-sw-yellow text-space-black hover:bg-sw-yellow/90 hover:shadow-[0_0_18px_rgba(255,232,31,0.45)]',
  secondary: 'border-jedi-blue text-jedi-blue hover:bg-jedi-blue hover:text-space-black',
  danger: 'border-sith-red text-sith-red hover:bg-sith-red hover:text-space-black',
}

export default function AnimatedButton({ children, variant = 'primary', className = '', disabled, onClick, type = 'button', as: Component = 'button', to, ...rest }: AnimatedButtonProps) {
  const MotionComponent = motion(Component)

  return (
    <MotionComponent
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-xl px-4 py-3 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={Component === 'button' ? type : undefined}
      to={to}
      {...rest}
    >
      {children}
    </MotionComponent>
  )
}
