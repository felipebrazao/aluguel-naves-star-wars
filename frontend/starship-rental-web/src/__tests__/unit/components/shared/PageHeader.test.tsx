import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PageHeader from '../../../../components/shared/PageHeader'

describe('PageHeader', () => {
    it('should render overline, title and description', () => {
        render(<PageHeader overline="Seção" title="Título Principal" description="Descrição detalhada." />)
        expect(screen.getByText('Seção')).toBeInTheDocument()
        expect(screen.getByText('Título Principal')).toBeInTheDocument()
        expect(screen.getByText('Descrição detalhada.')).toBeInTheDocument()
    })

    it('should render actions slot when provided', () => {
        render(
            <PageHeader
                overline="S"
                title="T"
                description="D"
                actions={<button>Nova Ação</button>}
            />,
        )
        expect(screen.getByRole('button', { name: 'Nova Ação' })).toBeInTheDocument()
    })

    it('should not render actions slot when not provided', () => {
        render(<PageHeader overline="S" title="T" description="D" />)
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should render children when provided', () => {
        render(
            <PageHeader overline="S" title="T" description="D">
                <p>Conteúdo filho</p>
            </PageHeader>,
        )
        expect(screen.getByText('Conteúdo filho')).toBeInTheDocument()
    })

    it('should not render children area when no children provided', () => {
        const { container } = render(<PageHeader overline="S" title="T" description="D" />)
        const divs = container.querySelectorAll('section > div')
        expect(divs.length).toBe(1)
    })
})
