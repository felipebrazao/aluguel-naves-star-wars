import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DataTable, { type DataTableColumn } from '../../../../components/shared/DataTable'

type Row = { id: string; name: string; value: number }

const columns: DataTableColumn<Row>[] = [
    { header: 'Nome', accessor: 'name' },
    { header: 'Valor', accessor: (row) => `R$ ${row.value}` },
]

const data: Row[] = [
    { id: '1', name: 'Millennium Falcon', value: 4500 },
    { id: '2', name: 'X-Wing', value: 3200 },
]

describe('DataTable', () => {
    it('should render column headers', () => {
        render(<DataTable columns={columns} data={data} />)
        expect(screen.getByText('Nome')).toBeInTheDocument()
        expect(screen.getByText('Valor')).toBeInTheDocument()
    })

    it('should render row data', () => {
        render(<DataTable columns={columns} data={data} />)
        expect(screen.getByText('Millennium Falcon')).toBeInTheDocument()
        expect(screen.getByText('X-Wing')).toBeInTheDocument()
    })

    it('should render accessor function result', () => {
        render(<DataTable columns={columns} data={data} />)
        expect(screen.getByText('R$ 4500')).toBeInTheDocument()
    })

    it('should render default empty message when data is empty', () => {
        render(<DataTable columns={columns} data={[]} />)
        expect(screen.getByText('Nenhum registro encontrado no sistema.')).toBeInTheDocument()
    })

    it('should render custom empty message', () => {
        render(<DataTable columns={columns} data={[]} emptyMessage="Sem resultados" />)
        expect(screen.getByText('Sem resultados')).toBeInTheDocument()
    })

    it('should render a table with thead and tbody', () => {
        render(<DataTable columns={columns} data={data} />)
        expect(screen.getByRole('table')).toBeInTheDocument()
    })
})
