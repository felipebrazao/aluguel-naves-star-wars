import type { ReactNode } from 'react'

export type DataTableColumn<T> = {
    readonly header: string
    readonly accessor: keyof T | ((row: T) => ReactNode)
}

export interface DataTableProps<T> {
    readonly columns: ReadonlyArray<DataTableColumn<T>>
    readonly data: ReadonlyArray<T>
    readonly emptyMessage?: string
    readonly rowKey?: keyof T | ((row: T) => string | number)
}

function DataTable<T>({ columns, data, emptyMessage = 'Nenhum registro encontrado no sistema.', rowKey }: DataTableProps<T>) {
    const getRowKey = (row: T) => {
        if (typeof rowKey === 'function') {
            return rowKey(row)
        }

        if (rowKey) {
            return row[rowKey] as string | number
        }

        if (typeof row === 'object' && row !== null && 'id' in row) {
            return (row as { id: string | number }).id
        }

        return JSON.stringify(row)
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-panel-border bg-black/30">
            <table className="table w-full">
                <thead className="border-b border-panel-border text-rebel-blue">
                    <tr className="text-xs uppercase tracking-[0.3em]">
                        {columns.map((column) => (
                            <th key={column.header} className="bg-transparent px-6 py-4 text-left font-semibold text-rebel-blue">
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="text-gray-200">
                    {data.length > 0 ? (
                        data.map((row) => (
                            <tr key={getRowKey(row)} className="border-t border-panel-border/70 transition-colors hover:bg-panel-dark/50">
                                {columns.map((column) => {
                                    const value = typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor]

                                    return (
                                        <td key={column.header} className="px-6 py-4 align-middle text-sm text-gray-200">
                                            {value as ReactNode}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="px-6 py-10 text-center text-sm text-gray-400" colSpan={columns.length}>
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default DataTable