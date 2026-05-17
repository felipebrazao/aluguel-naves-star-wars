import type { ReactNode } from 'react'

export interface PageHeaderProps {
    readonly overline: string
    readonly title: string
    readonly description: string
    readonly children?: ReactNode
    readonly actions?: ReactNode
    readonly className?: string
    readonly isHero?: boolean
}

function PageHeader({
    overline,
    title,
    description,
    children,
    actions,
    className = '',
    isHero = false,
}: Readonly<PageHeaderProps>) {
    const classes = [
        'rounded-3xl border border-panel-border p-8',
        isHero ? 'bg-gradient-to-br from-panel-dark to-black shadow-[0_0_40px_rgba(0,229,255,0.08)]' : 'bg-panel-dark',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <section className={classes}>
            <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.4em] text-rebel-blue">{overline}</p>
                    <h2 className="mt-3 text-3xl font-semibold text-sw-yellow sm:text-4xl">{title}</h2>
                    <p className="mt-4 text-sm leading-6 text-gray-300">{description}</p>
                </div>

                {actions ? <div className="flex shrink-0 items-start">{actions}</div> : null}
            </div>

            {children ? <div className="mt-6">{children}</div> : null}
        </section>
    )
}

export default PageHeader