
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
                className={`tabs tabs-bordered border-panel-border bg-panel-dark [--color-primary:#FFE81F] ${className}`}
                aria-label="Tabs"
                role="tablist"
                aria-orientation="horizontal"
            >
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.id || idx}
                        type="button"
                        className={`tab w-full px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors
							${activeIdx === idx
                                ? 'tab-active !text-sw-yellow !border-sw-yellow'
                                : '!text-gray-400 hover:!text-sw-yellow/70 hover:!border-sw-yellow/70'}
						`}
                        id={`tabs-item-${idx}`}
                        data-tab={`#tabs-panel-${idx}`}
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

            <div className="mt-3">
                {tabs.map((tab, idx) => (
                    <div
                        key={tab.id || idx}
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
