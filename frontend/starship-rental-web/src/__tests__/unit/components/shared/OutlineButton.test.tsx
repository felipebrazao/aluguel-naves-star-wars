import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import OutlineButton from '../../../../components/shared/OutlineButton'

describe('OutlineButton', () => {
    it('should render children', () => {
        render(<OutlineButton>Clique aqui</OutlineButton>)
        expect(screen.getByRole('button', { name: 'Clique aqui' })).toBeInTheDocument()
    })

    it('should call onClick when clicked', async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()
        render(<OutlineButton onClick={onClick}>Clique</OutlineButton>)
        await user.click(screen.getByRole('button'))
        expect(onClick).toHaveBeenCalledOnce()
    })

    it('should be disabled when disabled prop is true', () => {
        render(<OutlineButton disabled>Desabilitado</OutlineButton>)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should not call onClick when disabled', async () => {
        const onClick = vi.fn()
        const user = userEvent.setup()
        render(<OutlineButton disabled onClick={onClick}>Desabilitado</OutlineButton>)
        await user.click(screen.getByRole('button'))
        expect(onClick).not.toHaveBeenCalled()
    })

    it('should render as anchor when as="a" is provided', () => {
        render(<OutlineButton as="a" href="/rota">Link</OutlineButton>)
        expect(screen.getByRole('link', { name: 'Link' })).toBeInTheDocument()
    })
})
