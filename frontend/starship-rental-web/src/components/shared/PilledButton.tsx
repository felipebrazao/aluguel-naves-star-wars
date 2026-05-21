import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react'

type PilledButtonVariant = 'primary' | 'secondary' | 'danger'

type PilledButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: ElementType
    variant?: PilledButtonVariant
    active?: boolean
    children: ReactNode
    [key: string]: unknown
}

const variantClasses: Record<PilledButtonVariant, string> = {
    primary:
        'border-sw-yellow text-sw-yellow bg-transparent hover:bg-sw-yellow hover:text-space-black hover:shadow-[0_0_18px_rgba(255,232,31,0.45)]',
    secondary:
        'border-jedi-blue text-jedi-blue bg-transparent hover:bg-jedi-blue hover:text-space-black hover:shadow-[0_0_18px_rgba(46,103,248,0.45)]',
    danger:
        'border-sith-red text-sith-red bg-transparent hover:bg-sith-red hover:text-space-black hover:shadow-[0_0_18px_rgba(235,33,46,0.45)]',
}

const activeClasses: Record<PilledButtonVariant, string> = {
    primary: 'bg-sw-yellow/10 shadow-[0_0_18px_rgba(255,232,31,0.18)]',
    secondary: 'bg-jedi-blue/10 shadow-[0_0_18px_rgba(46,103,248,0.18)]',
    danger: 'bg-sith-red/10 shadow-[0_0_18px_rgba(235,33,46,0.18)]',
}

function PilledButton({
    as: Component = 'button',
    variant = 'primary',
    active = false,
    className = '',
    children,
    type = 'button',
    disabled = false,
    ...props
}: PilledButtonProps) {
    const classes = [
        'btn rounded-full border transition-all duration-200',
        variantClasses[variant],
        active ? activeClasses[variant] : '',
        'disabled:border-gray-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed disabled:pointer-events-none',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const componentProps = {
        className: classes,
        ...(Component === 'button' ? { type, disabled } : {}),
        ...props,
    }

    return <Component {...componentProps}>{children}</Component>
}

export default PilledButton
