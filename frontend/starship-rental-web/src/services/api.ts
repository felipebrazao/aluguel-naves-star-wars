const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081'

type ApiFetchOptions = {
    auth?: boolean
}

export function apiUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${API_BASE_URL}${normalizedPath}`
}

export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    if (!token) {
        return {}
    }

    return {
        Authorization: `Bearer ${token}`,
    }
}

export function apiFetch(path: string, init: RequestInit = {}, options: ApiFetchOptions = {}): Promise<Response> {
    const { auth = true } = options
    const authHeaders = auth ? getAuthHeaders() : {}
    const normalizedHeaders = init.headers ?? undefined

    return fetch(apiUrl(path), {
        ...init,
        headers: {
            ...authHeaders,
            ...normalizedHeaders,
        },
    })
}
