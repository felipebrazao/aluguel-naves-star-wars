import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import PlanetsManagement from '../../../../pages/management/PlanetsManagement'

describe('PlanetsManagement', () => {
    describe('Render', () => {
        it('should render page header', () => {
            render(<PlanetsManagement />)
            expect(screen.getByText('Gestão de Planetas')).toBeInTheDocument()
            expect(screen.getByText('Operações')).toBeInTheDocument()
        })

        it('should render Adicionar Planeta button', () => {
            render(<PlanetsManagement />)
            expect(screen.getByRole('button', { name: /adicionar planeta/i })).toBeInTheDocument()
        })

        it('should render planets in table', () => {
            render(<PlanetsManagement />)
            expect(screen.getByText('Coruscant')).toBeInTheDocument()
            expect(screen.getByText('Tatooine')).toBeInTheDocument()
            expect(screen.getByText('Mustafar')).toBeInTheDocument()
        })

        it('should render planet sectors', () => {
            render(<PlanetsManagement />)
            expect(screen.getByText('Core Worlds')).toBeInTheDocument()
            expect(screen.getByText('Outer Rim')).toBeInTheDocument()
            expect(screen.getByText('Atravis')).toBeInTheDocument()
        })

        it('should render status badges for each planet', () => {
            render(<PlanetsManagement />)
            expect(screen.getByText('ATIVO')).toBeInTheDocument()
            expect(screen.getByText('RESTRITO')).toBeInTheDocument()
            expect(screen.getByText('BLOQUEADO')).toBeInTheDocument()
        })

        it('should render Gerir Planeta buttons for each planet', () => {
            render(<PlanetsManagement />)
            expect(screen.getAllByRole('button', { name: /gerir planeta/i })).toHaveLength(3)
        })
    })

    describe('Planet modal', () => {
        it('should open modal with planet name when Gerir Planeta is clicked', async () => {
            const user = userEvent.setup()
            render(<PlanetsManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir planeta/i })[0])
            expect(screen.getByText(/gerir planeta - coruscant/i)).toBeInTheDocument()
        })

        it('should close modal when Cancelar is clicked', async () => {
            const user = userEvent.setup()
            render(<PlanetsManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir planeta/i })[0])
            await user.click(screen.getByRole('button', { name: /cancelar/i }))
            expect(screen.queryByText(/gerir planeta - coruscant/i)).not.toBeInTheDocument()
        })

        it('should show restriction reason field when RESTRITO is selected', async () => {
            const user = userEvent.setup()
            render(<PlanetsManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir planeta/i })[0])
            await user.selectOptions(screen.getByRole('combobox', { name: /novo status/i }), 'RESTRITO')
            expect(screen.getByLabelText(/motivo da restrição/i)).toBeInTheDocument()
        })

        it('should show restriction reason field when BLOQUEADO is selected', async () => {
            const user = userEvent.setup()
            render(<PlanetsManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir planeta/i })[0])
            await user.selectOptions(screen.getByRole('combobox', { name: /novo status/i }), 'BLOQUEADO')
            expect(screen.getByLabelText(/motivo da restrição/i)).toBeInTheDocument()
        })

        it('should hide restriction reason field when ATIVO is selected', async () => {
            const user = userEvent.setup()
            render(<PlanetsManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir planeta/i })[1])
            await user.selectOptions(screen.getByRole('combobox', { name: /novo status/i }), 'ATIVO')
            expect(screen.queryByLabelText(/motivo da restrição/i)).not.toBeInTheDocument()
        })

        it('should allow filling travel advisory and restriction reason', async () => {
            const user = userEvent.setup()
            render(<PlanetsManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir planeta/i })[0])
            await user.selectOptions(screen.getByRole('combobox', { name: /novo status/i }), 'RESTRITO')
            await user.type(screen.getByLabelText(/aviso de viagem/i), 'Área de conflito')
            await user.type(screen.getByLabelText(/motivo da restrição/i), 'Guerra Civil')
            expect(screen.getByLabelText(/aviso de viagem/i)).toHaveValue('Área de conflito')
            expect(screen.getByLabelText(/motivo da restrição/i)).toHaveValue('Guerra Civil')
        })

        it('should close modal after submitting the form', async () => {
            const user = userEvent.setup()
            render(<PlanetsManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir planeta/i })[0])
            const dialog = screen.getByRole('dialog')
            await user.click(within(dialog).getByRole('button', { name: /guardar alterações/i }))
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
