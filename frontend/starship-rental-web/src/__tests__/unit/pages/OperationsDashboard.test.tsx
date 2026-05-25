import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import OperationsDashboard from '../../../pages/OperationsDashboard'

describe('OperationsDashboard', () => {
    it('should render page header', () => {
        render(<OperationsDashboard />)
        expect(screen.getByText('Dashboard Geral')).toBeInTheDocument()
        expect(screen.getByText('Operações')).toBeInTheDocument()
    })

    it('should render table column headers', () => {
        render(<OperationsDashboard />)
        expect(screen.getByText('Cliente')).toBeInTheDocument()
        expect(screen.getByText('Nave')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Data')).toBeInTheDocument()
        expect(screen.getByText('Total')).toBeInTheDocument()
    })

    it('should render customer names', () => {
        render(<OperationsDashboard />)
        expect(screen.getByText('Luke Skywalker')).toBeInTheDocument()
        expect(screen.getByText('Han Solo')).toBeInTheDocument()
        expect(screen.getByText('Leia Organa')).toBeInTheDocument()
        expect(screen.getByText('Lando Calrissian')).toBeInTheDocument()
    })

    it('should render all rental statuses as badges', () => {
        render(<OperationsDashboard />)
        expect(screen.getByText('ATIVO')).toBeInTheDocument()
        expect(screen.getByText('EM_USO')).toBeInTheDocument()
        expect(screen.getByText('FINALIZADO')).toBeInTheDocument()
        expect(screen.getByText('CANCELADO')).toBeInTheDocument()
    })

    it('should render formatted totals', () => {
        render(<OperationsDashboard />)
        expect(screen.getByText(/créditos 3\.200/i)).toBeInTheDocument()
        expect(screen.getByText(/créditos 4\.500/i)).toBeInTheDocument()
    })
})
