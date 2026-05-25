import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Modal from '../../../../components/shared/Modal'

describe('Modal', () => {
    it('should not render when isOpen is false', () => {
        render(<Modal isOpen={false} onClose={vi.fn()} title="Título"><p>Conteúdo</p></Modal>)
        expect(screen.queryByText('Título')).not.toBeInTheDocument()
        expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument()
    })

    it('should render title and children when open', () => {
        render(<Modal isOpen onClose={vi.fn()} title="Título"><p>Conteúdo</p></Modal>)
        expect(screen.getByText('Título')).toBeInTheDocument()
        expect(screen.getByText('Conteúdo')).toBeInTheDocument()
    })

    it('should call onClose when close button inside dialog is clicked', async () => {
        const onClose = vi.fn()
        const user = userEvent.setup()
        render(<Modal isOpen onClose={onClose} title="Título"><p>Conteúdo</p></Modal>)
        const closeButtons = screen.getAllByRole('button', { name: /fechar modal/i })
        await user.click(closeButtons[closeButtons.length - 1])
        expect(onClose).toHaveBeenCalledOnce()
    })

    it('should call onClose when Escape key is pressed', async () => {
        const onClose = vi.fn()
        const user = userEvent.setup()
        render(<Modal isOpen onClose={onClose} title="Título"><p>Conteúdo</p></Modal>)
        await user.keyboard('{Escape}')
        expect(onClose).toHaveBeenCalledOnce()
    })

    it('should block body scroll when open', () => {
        render(<Modal isOpen onClose={vi.fn()} title="Título"><p>Conteúdo</p></Modal>)
        expect(document.body.style.overflow).toBe('hidden')
    })
})
