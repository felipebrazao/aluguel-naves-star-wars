import { useEffect, useId } from 'react'
import type { ReactNode } from 'react'

export interface ModalProps {
    readonly isOpen: boolean
    readonly onClose: () => void
    readonly title: string
    readonly children: ReactNode
}

function Modal({ isOpen, onClose, title, children }: Readonly<ModalProps>) {
    const titleId = useId()

    useEffect(() => {
        if (!isOpen) {
            return undefined
        }

        const originalOverflow = document.body.style.overflow

        document.body.style.overflow = 'hidden'

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        globalThis.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = originalOverflow
            globalThis.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) {
        return null
    }

    return (
        <>
            <button
                type="button"
                aria-label="Fechar modal"
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={onClose}
            />

            <dialog
                open
                aria-labelledby={titleId}
                className="fixed inset-0 z-50 m-0 flex max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4"
            >
                <div className="w-full max-w-2xl rounded-3xl border border-panel-border bg-panel-dark p-6 text-gray-200 shadow-2xl">
                    <div className="flex items-start justify-between gap-4">
                        <h3 id={titleId} className="text-2xl font-semibold text-sw-yellow">{title}</h3>
                        <button
                            type="button"
                            aria-label="Fechar modal"
                            className="rounded-full border border-panel-border px-3 py-1 text-sm text-gray-300 transition-colors hover:border-sw-yellow hover:text-sw-yellow"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>

                    <div className="mt-6">{children}</div>
                </div>
            </dialog>
        </>
    )
}

export default Modal