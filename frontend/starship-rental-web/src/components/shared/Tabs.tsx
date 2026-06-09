
import { useState } from 'react'
import type { ReactNode } from 'react'

type Tab = {
    readonly label: string
    readonly content: ReactNode
    readonly id?: string
}

type TabsProps = {
    readonly tabs: readonly Tab[]
    readonly initialTab?: number
    readonly className?: string
}

function Tabs({ tabs, initialTab = 0, className = '' }: Readonly<TabsProps>) {
    const [activeIdx, setActiveIdx] = useState(initialTab)

    return (
        <div>
            <div
                className={`inline-flex w-full gap-1 rounded-2xl border border-panel-border bg-black/40 p-1 ${className}`}
                aria-label="Tabs"
                role="tablist"
                aria-orientation="horizontal"
            >
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.id ?? idx}
                        type="button"
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-200 ${
                            activeIdx === idx
                                ? 'bg-sw-yellow text-space-black shadow-[0_0_14px_rgba(255,232,31,0.25)]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        }`}
                        id={`tabs-item-${idx}`}
                        aria-controls={`tabs-panel-${idx}`}
                        role="tab"
                        aria-selected={activeIdx === idx}
                        tabIndex={activeIdx === idx ? 0 : -1}
                        onClick={() => setActiveIdx(idx)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {tabs.map((tab, idx) => (
                    <div
                        key={tab.id ?? idx}
                        id={`tabs-panel-${idx}`}
                        role="tabpanel"
                        aria-labelledby={`tabs-item-${idx}`}
                        className={activeIdx === idx ? '' : 'hidden'}
                    >
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Tabs
