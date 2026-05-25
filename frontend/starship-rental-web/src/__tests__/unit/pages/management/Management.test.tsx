import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Management from '../../../../pages/management/Management'

describe('Management', () => {
    it('should render Frota and Planetas tabs', () => {
        render(<Management />)
        expect(screen.getByRole('tab', { name: 'Frota' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Planetas' })).toBeInTheDocument()
    })

    it('should show FleetManagement content by default', () => {
        render(<Management />)
        expect(screen.getByText('Gestão de Frota')).toBeInTheDocument()
    })
})
