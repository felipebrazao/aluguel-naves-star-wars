import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SpaceshipCard, { type SpaceshipCardProps } from '../../../components/SpaceshipCard'

const defaultProps: SpaceshipCardProps = {
    id: 'millennium-falcon',
    name: 'Millennium Falcon',
    model: 'YT-1300',
    dailyPrice: 4500,
    capacity: 6,
    status: 'DISPONIVEL',
}

function renderCard(props: Partial<SpaceshipCardProps> = {}) {
    return render(
        <MemoryRouter>
            <SpaceshipCard {...defaultProps} {...props} />
        </MemoryRouter>,
    )
}

describe('SpaceshipCard', () => {
    it('should render ship name', () => {
        renderCard()
        expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
    })

    it('should render ship model', () => {
        renderCard()
        expect(screen.getByText('YT-1300')).toBeInTheDocument()
    })

    it('should render formatted daily price', () => {
        renderCard()
        expect(screen.getByText('R$ 4500.00')).toBeInTheDocument()
    })

    it('should render capacity with label', () => {
        renderCard()
        expect(screen.getByText('6 tripulantes')).toBeInTheDocument()
    })

    it('should render DISPONIVEL status badge', () => {
        renderCard({ status: 'DISPONIVEL' })
        expect(screen.getByText('DISPONIVEL')).toBeInTheDocument()
    })

    it('should render MANUTENCAO status badge', () => {
        renderCard({ status: 'MANUTENCAO' })
        expect(screen.getByText('MANUTENCAO')).toBeInTheDocument()
    })

    it('should render DESATIVADA status badge', () => {
        renderCard({ status: 'DESATIVADA' })
        expect(screen.getByText('DESATIVADA')).toBeInTheDocument()
    })

    it('should render a link to the ship detail page', () => {
        renderCard()
        const link = screen.getByRole('link', { name: /ver detalhes/i })
        expect(link).toHaveAttribute('href', '/nave/millennium-falcon')
    })

    it('should render as an article element', () => {
        renderCard()
        expect(screen.getByRole('article')).toBeInTheDocument()
    })
})
