import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import FleetManagement from '../../../../pages/management/FleetManagement'

describe('FleetManagement', () => {
    describe('Render', () => {
        it('should render page header', () => {
            render(<FleetManagement />)
            expect(screen.getByText('Gestão de Frota')).toBeInTheDocument()
            expect(screen.getByText('Operações')).toBeInTheDocument()
        })

        it('should render Adicionar Nave button', () => {
            render(<FleetManagement />)
            expect(screen.getByRole('button', { name: /adicionar nave/i })).toBeInTheDocument()
        })

        it('should render fleet ships in table', () => {
            render(<FleetManagement />)
            expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
            expect(screen.getByText('X-Wing Starfighter')).toBeInTheDocument()
            expect(screen.getByText('TIE Advanced x1')).toBeInTheDocument()
        })

        it('should render status badges for each ship', () => {
            render(<FleetManagement />)
            expect(screen.getByText('DISPONIVEL')).toBeInTheDocument()
            expect(screen.getByText('MANUTENCAO')).toBeInTheDocument()
            expect(screen.getByText('DESATIVADA')).toBeInTheDocument()
        })

        it('should render Gerir Status buttons for each ship', () => {
            render(<FleetManagement />)
            expect(screen.getAllByRole('button', { name: /gerir status/i })).toHaveLength(3)
        })
    })

    describe('Status modal', () => {
        it('should open modal with ship name when Gerir Status is clicked', async () => {
            const user = userEvent.setup()
            render(<FleetManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir status/i })[0])
            expect(screen.getByText(/gerir status - millennium falcon/i)).toBeInTheDocument()
        })

        it('should close modal when Cancelar is clicked', async () => {
            const user = userEvent.setup()
            render(<FleetManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir status/i })[0])
            await user.click(screen.getByRole('button', { name: /cancelar/i }))
            expect(screen.queryByText(/gerir status - millennium falcon/i)).not.toBeInTheDocument()
        })

        it('should show maintenance fields when MANUTENCAO status is selected', async () => {
            const user = userEvent.setup()
            render(<FleetManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir status/i })[0])
            await user.selectOptions(screen.getByRole('combobox', { name: /novo status/i }), 'MANUTENCAO')
            expect(screen.getByLabelText(/custo estimado/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/descrição do reparo/i)).toBeInTheDocument()
        })

        it('should hide maintenance fields when DISPONIVEL status is selected', async () => {
            const user = userEvent.setup()
            render(<FleetManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir status/i })[1])
            await user.selectOptions(screen.getByRole('combobox', { name: /novo status/i }), 'DISPONIVEL')
            expect(screen.queryByLabelText(/custo estimado/i)).not.toBeInTheDocument()
        })

        it('should allow filling maintenance fields', async () => {
            const user = userEvent.setup()
            render(<FleetManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir status/i })[0])
            await user.selectOptions(screen.getByRole('combobox', { name: /novo status/i }), 'MANUTENCAO')
            await user.type(screen.getByLabelText(/custo estimado/i), '1500')
            await user.type(screen.getByLabelText(/descrição do reparo/i), 'Troca de motor')
            expect(screen.getByLabelText(/custo estimado/i)).toHaveValue(1500)
            expect(screen.getByLabelText(/descrição do reparo/i)).toHaveValue('Troca de motor')
        })

        it('should close modal after submitting the form', async () => {
            const user = userEvent.setup()
            render(<FleetManagement />)
            await user.click(screen.getAllByRole('button', { name: /gerir status/i })[0])
            const dialog = screen.getByRole('dialog')
            await user.click(within(dialog).getByRole('button', { name: /guardar alterações/i }))
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
