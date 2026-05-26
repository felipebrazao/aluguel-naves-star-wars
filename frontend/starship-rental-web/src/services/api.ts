import axios, { type InternalAxiosRequestConfig } from 'axios'
import type {
    ActiveToggleResult,
    CreatePaymentDTO,
    CreatePlanetDTO,
    CreateRentalDTO,
    CreateSpaceshipDTO,
    CreateSpaceshipStatusDTO,
    CreateUserDTO,
    ImportResult,
    LoginResponse,
    Payment,
    Planet,
    Rental,
    Spaceship,
    SpaceshipStatus,
    User,
} from '../types/api'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
    timeout: 30000,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }

        return Promise.reject(error)
    },
)

export function extractApiErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as
            | { message?: string; error?: string; detail?: string; title?: string; errors?: unknown; fieldErrors?: unknown }
            | string
            | undefined

        if (typeof data === 'string') {
            return data
        }

        if (data && typeof data === 'object') {
            if (typeof data.message === 'string') return data.message
            if (typeof data.detail === 'string') return data.detail
            if (typeof data.error === 'string') return data.error
            if (typeof data.title === 'string') return data.title

            if (Array.isArray(data.fieldErrors) && data.fieldErrors.length > 0) {
                const firstFieldError = data.fieldErrors[0] as { defaultMessage?: string; message?: string } | undefined
                if (typeof firstFieldError?.defaultMessage === 'string') return firstFieldError.defaultMessage
                if (typeof firstFieldError?.message === 'string') return firstFieldError.message
            }

            if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
                const firstMessage = Object.values(data.errors as Record<string, unknown>).find((value) => typeof value === 'string')
                if (typeof firstMessage === 'string') return firstMessage
            }
        }

        return error.response?.statusText || error.message || 'Erro inesperado'
    }

    if (error instanceof Error) {
        return error.message
    }

    return 'Erro inesperado'
}

const toLocalDateTimeString = (value: string, fallbackTime: 'start' | 'end' = 'start') => {
    if (!value || value.includes('T')) {
        return value
    }

    return `${value}T${fallbackTime === 'start' ? '00:00:00' : '23:59:59'}`
}

export const spaceshipService = {
    getAll(active?: boolean): Promise<Spaceship[]> {
        return api.get<Spaceship[]>('/spaceships', { params: { active } }).then((response) => response.data)
    },
    getAvailable(): Promise<Spaceship[]> {
        return api.get<Spaceship[]>('/spaceships', { params: { active: true } }).then((response) => response.data)
    },
    importSpaceships(): Promise<ImportResult> {
        return api.post<ImportResult>('/spaceships/import').then((response) => response.data)
    },
    create(dto: CreateSpaceshipDTO): Promise<Spaceship> {
        return api.post<Spaceship>('/spaceships', dto).then((response) => response.data)
    },
    findAll(active?: boolean): Promise<Spaceship[]> {
        return api.get<Spaceship[]>('/spaceships', { params: { active } }).then((response) => response.data)
    },
    findById(id: number): Promise<Spaceship> {
        return api.get<Spaceship>(`/spaceships/${id}`).then((response) => response.data)
    },
    getById(id: number): Promise<Spaceship> {
        return api.get<Spaceship>(`/spaceships/${id}`).then((response) => response.data)
    },
    update(id: number, dto: CreateSpaceshipDTO): Promise<Spaceship> {
        return api.put<Spaceship>(`/spaceships/${id}`, dto).then((response) => response.data)
    },
    updateStatus(id: number, dto: CreateSpaceshipStatusDTO | SpaceshipStatus): Promise<Spaceship> {
        const payload =
            typeof dto === 'string'
                ? { status: dto.toLowerCase() as SpaceshipStatus }
                : { ...dto, status: dto.status.toLowerCase() as SpaceshipStatus }
        return api.patch<Spaceship>(`/spaceships/${id}/status`, payload).then((response) => response.data)
    },
    toggleActive(id: number): Promise<ActiveToggleResult> {
        return api.patch<ActiveToggleResult>(`/spaceships/${id}/active`).then((response) => response.data)
    },
}

export const rentalService = {
    create(dto: CreateRentalDTO): Promise<Rental> {
        return api
            .post<Rental>('/rentals', {
                ...dto,
                startDate: toLocalDateTimeString(dto.startDate, 'start'),
                endDate: toLocalDateTimeString(dto.endDate, 'end'),
            })
            .then((response) => response.data)
    },
    getByUser(userId: number): Promise<Rental[]> {
        return api.get<Rental[]>('/rentals').then((response) => response.data.filter((rental) => rental.userId === userId))
    },
    findAll(): Promise<Rental[]> {
        return api.get<Rental[]>('/rentals').then((response) => response.data)
    },
    findById(id: number): Promise<Rental> {
        return api.get<Rental>(`/rentals/${id}`).then((response) => response.data)
    },
    conclude(id: number): Promise<Rental> {
        return api.patch<Rental>(`/rentals/${id}/conclude`).then((response) => response.data)
    },
    cancel(id: number): Promise<Rental> {
        return api.patch<Rental>(`/rentals/${id}/cancel`).then((response) => response.data)
    },
}

export const userService = {
    importUsers(): Promise<ImportResult> {
        return api.post<ImportResult>('/users/import').then((response) => response.data)
    },
    create(dto: CreateUserDTO): Promise<User> {
        return api.post<User>('/users', dto).then((response) => response.data)
    },
    findAll(active?: boolean): Promise<User[]> {
        return api.get<User[]>('/users', { params: { active } }).then((response) => response.data)
    },
    findById(id: number): Promise<User> {
        return api.get<User>(`/users/${id}`).then((response) => response.data)
    },
    update(id: number, dto: CreateUserDTO): Promise<User> {
        return api.put<User>(`/users/${id}`, dto).then((response) => response.data)
    },
    toggleActive(id: number): Promise<ActiveToggleResult> {
        return api.patch<ActiveToggleResult>(`/users/${id}/active`).then((response) => response.data)
    },
    login(body: { email: string; password: string }): Promise<LoginResponse> {
        return api.post<LoginResponse>('/users/login', body).then((response) => response.data)
    },
}

export const planetService = {
    getAll(active?: boolean): Promise<Planet[]> {
        return api.get<Planet[]>('/planets', { params: { active } }).then((response) => response.data)
    },
    importPlanets(): Promise<ImportResult> {
        return api.post<ImportResult>('/planets/import').then((response) => response.data)
    },
    create(dto: CreatePlanetDTO): Promise<Planet> {
        return api.post<Planet>('/planets', dto).then((response) => response.data)
    },
    findAll(active?: boolean): Promise<Planet[]> {
        return api.get<Planet[]>('/planets', { params: { active } }).then((response) => response.data)
    },
    findById(id: number): Promise<Planet> {
        return api.get<Planet>(`/planets/${id}`).then((response) => response.data)
    },
    update(id: number, dto: CreatePlanetDTO): Promise<Planet> {
        return api.put<Planet>(`/planets/${id}`, dto).then((response) => response.data)
    },
    toggleActive(id: number): Promise<ActiveToggleResult> {
        return api.patch<ActiveToggleResult>(`/planets/${id}/active`).then((response) => response.data)
    },
}

export const paymentService = {
    findAll(): Promise<Payment[]> {
        return api.get<Payment[]>('/payments').then((response) => response.data)
    },
    findById(id: number): Promise<Payment> {
        return api.get<Payment>(`/payments/${id}`).then((response) => response.data)
    },
    findByRentalId(rentalId: number): Promise<Payment> {
        return api.get<Payment>(`/payments/rental/${rentalId}`).then((response) => response.data)
    },
    pay(id: number, dto: CreatePaymentDTO): Promise<Payment> {
        return api.patch<Payment>(`/payments/${id}/pay`, dto).then((response) => response.data)
    },
    cancel(id: number): Promise<Payment> {
        return api.patch<Payment>(`/payments/${id}/cancel`).then((response) => response.data)
    },
}
