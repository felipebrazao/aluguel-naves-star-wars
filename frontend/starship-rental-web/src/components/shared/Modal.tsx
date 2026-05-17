import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export interface ModalProps {
    readonly isOpen: boolean
    readonly onClose: () => void
    readonly title: string
    readonly children: ReactNode
}

function Modal({ isOpen, onClose, title, children }: Readonly<ModalProps>) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current

        if (!dialog) return

        if (isOpen && !dialog.open) {
            dialog.showModal()
        }

        if (!isOpen && dialog.open) {
            dialog.close()
        }
    }, [isOpen])

    return (
        <dialog
            ref={dialogRef}
            className="modal"
            onCancel={(event) => {
                event.preventDefault()
                onClose()
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose()
                }
            }}
        >
            <div className="modal-box border border-panel-border bg-panel-dark text-gray-200">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-semibold text-sw-yellow">{title}</h3>
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
    )
}

export default Modal