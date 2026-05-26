import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function AnimatedCard({ children, className = '', hover = true }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      className={`rounded-2xl border border-panel-border bg-panel-dark shadow-[0_0_24px_rgba(0,0,0,0.35)] ${className}`}
    >
      {children}
    </motion.div>
  )
}
