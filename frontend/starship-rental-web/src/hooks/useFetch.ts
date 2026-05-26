import { useCallback, useEffect, useState } from 'react'

export function useFetch<T>(fetcher: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const runFetch = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const result = await fetcher()
            setData(result)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }, [fetcher])

    useEffect(() => {
        void runFetch()
    }, [runFetch])

    return {
        data,
        loading,
        error,
        refetch: runFetch,
    }
}
