import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MyRentals from '../../../pages/MyRentals'

describe('MyRentals', () => {
    it('should render page header', () => {
        render(<MyRentals />)
        expect(screen.getByText('Meus Aluguéis')).toBeInTheDocument()
        expect(screen.getByText('Cliente')).toBeInTheDocument()
    })

    it('should render table column headers', () => {
        render(<MyRentals />)
        expect(screen.getByText('Nave')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Data')).toBeInTheDocument()
        expect(screen.getByText('Valor')).toBeInTheDocument()
    })

    it('should render rental ship names', () => {
        render(<MyRentals />)
        expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
        expect(screen.getByText('X-Wing Starfighter')).toBeInTheDocument()
    })

    it('should render rental statuses', () => {
        render(<MyRentals />)
        expect(screen.getByText('ATIVO')).toBeInTheDocument()
        expect(screen.getByText('FINALIZADO')).toBeInTheDocument()
    })

    it('should render rental dates', () => {
        render(<MyRentals />)
        expect(screen.getByText('17/05/2026')).toBeInTheDocument()
        expect(screen.getByText('12/05/2026')).toBeInTheDocument()
    })
})
