import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react'

type OutlineButtonVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'

type OutlineButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: ElementType
    variant?: OutlineButtonVariant
    children: ReactNode
    [key: string]: unknown
}

const variantClasses: Record<OutlineButtonVariant, string> = {
    default:
        'btn btn-outline border-sw-yellow/40 bg-sw-yellow/10 text-sw-yellow hover:bg-sw-yellow hover:text-space-black',
    primary:
        'btn btn-outline border-sw-yellow/40 bg-sw-yellow/10 text-sw-yellow hover:bg-sw-yellow hover:text-space-black',
    secondary:
        'btn btn-outline border-rebel-blue/40 bg-rebel-blue/10 text-rebel-blue hover:bg-rebel-blue hover:text-space-black',
    accent:
        'btn btn-outline border-rebel-blue/40 bg-rebel-blue/10 text-rebel-blue hover:bg-rebel-blue hover:text-space-black',
    info:
        'btn btn-outline border-rebel-blue/40 bg-rebel-blue/10 text-rebel-blue hover:bg-rebel-blue hover:text-space-black',
    success:
        'btn btn-outline border-rebel-blue/40 bg-rebel-blue/10 text-rebel-blue hover:bg-rebel-blue hover:text-space-black',
    warning:
        'btn btn-outline border-sw-yellow/40 bg-sw-yellow/10 text-sw-yellow hover:bg-sw-yellow hover:text-space-black',
    error:
        'btn btn-outline border-empire-red/40 bg-empire-red/10 text-empire-red hover:bg-empire-red hover:text-space-black',
}

function OutlineButton({
    as: Component = 'button',
    variant = 'default',
    className = '',
    children,
    type = 'button',
    disabled = false,
    ...props
}: OutlineButtonProps) {
    const classes = [
        'inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200',
        variantClasses[variant],
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

export default OutlineButton
