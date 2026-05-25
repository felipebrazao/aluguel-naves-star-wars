import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import PilledButton from '../../../../components/shared/PilledButton'

describe('PilledButton', () => {
    it('should render children', () => {
        render(<PilledButton>Botão</PilledButton>)
        expect(screen.getByRole('button', { name: 'Botão' })).toBeInTheDocument()
    })

    it('should call onClick when clicked', async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()
        render(<PilledButton onClick={onClick}>Clique</PilledButton>)
        await user.click(screen.getByRole('button'))
        expect(onClick).toHaveBeenCalledOnce()
    })

    it('should be disabled when disabled prop is true', () => {
        render(<PilledButton disabled>Desabilitado</PilledButton>)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should not call onClick when disabled', async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()
        render(<PilledButton disabled onClick={onClick}>Desabilitado</PilledButton>)
        await user.click(screen.getByRole('button'))
        expect(onClick).not.toHaveBeenCalled()
    })

    it('should render as NavLink when as prop is provided', () => {
        render(<PilledButton as="a" href="/rota">Link</PilledButton>)
        expect(screen.getByRole('link', { name: 'Link' })).toBeInTheDocument()
    })
})
