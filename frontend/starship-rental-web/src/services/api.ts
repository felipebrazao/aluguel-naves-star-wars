import axios, { type InternalAxiosRequestConfig } from 'axios'
import type {
    CreatePaymentDTO,
    CreateRentalDTO,
    CreateUserDTO,
    CreatePlanetDTO,
    CreateSpaceshipDTO,
    Payment,
    Planet,
    Rental,
    Spaceship,
    SpaceshipStatus,
    User,
} from '../types/api'

export const api = axios.create({
    baseURL: 'http://localhost:8080',
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

type ImportResult = {
    mensagem: string
    totalNaves?: number
    totalPlanetas?: number
    totalUsuarios?: number
}

type ActiveToggleResult = {
    id: number
    name: string
    active: boolean
}

type LoginResponse = {
    token: string
    user: User
}

export const spaceshipService = {
    getAll(): Promise<Spaceship[]> {
        return api.get<Spaceship[]>('/spaceships').then((r) => r.data)
    },
    getAvailable(): Promise<Spaceship[]> {
        return api.get<Spaceship[]>('/spaceships', { params: { active: true } }).then((r) => r.data)
    },
    importSpaceships(): Promise<ImportResult> {
        return api.post<ImportResult>('/spaceships/import').then((r) => r.data)
    },
    create(dto: CreateSpaceshipDTO): Promise<Spaceship> {
        return api.post<Spaceship>('/spaceships', dto).then((r) => r.data)
    },
    findAll(active?: boolean): Promise<Spaceship[]> {
        return api.get<Spaceship[]>('/spaceships', { params: { active } }).then((r) => r.data)
    },
    findById(id: number): Promise<Spaceship> {
        return api.get<Spaceship>(`/spaceships/${id}`).then((r) => r.data)
    },
    getById(id: number): Promise<Spaceship> {
        return api.get<Spaceship>(`/spaceships/${id}`).then((r) => r.data)
    },
    update(id: number, dto: CreateSpaceshipDTO): Promise<Spaceship> {
        return api.put<Spaceship>(`/spaceships/${id}`, dto).then((r) => r.data)
    },
    updateStatus(id: number, status: SpaceshipStatus): Promise<Spaceship> {
        return api.patch<Spaceship>(`/spaceships/${id}/status`, { status }).then((r) => r.data)
    },
    toggleActive(id: number): Promise<ActiveToggleResult> {
        return api.patch<ActiveToggleResult>(`/spaceships/${id}/active`).then((r) => r.data)
    },
}

export const rentalService = {
    create(dto: CreateRentalDTO): Promise<Rental> {
        return api.post<Rental>('/rentals', dto).then((r) => r.data)
    },
    getByUser(userId: number): Promise<Rental[]> {
        return api.get<Rental[]>('/rentals').then((r) => r.data.filter((rental) => rental.userId === userId))
    },
    findAll(): Promise<Rental[]> {
        return api.get<Rental[]>('/rentals').then((r) => r.data)
    },
    findById(id: number): Promise<Rental> {
        return api.get<Rental>(`/rentals/${id}`).then((r) => r.data)
    },
    conclude(id: number): Promise<Rental> {
        return api.patch<Rental>(`/rentals/${id}/conclude`).then((r) => r.data)
    },
    cancel(id: number): Promise<Rental> {
        return api.patch<Rental>(`/rentals/${id}/cancel`).then((r) => r.data)
    },
}

export const userService = {
    importUsers(): Promise<ImportResult> {
        return api.post<ImportResult>('/users/import').then((r) => r.data)
    },
    create(dto: CreateUserDTO): Promise<User> {
        return api.post<User>('/users', dto).then((r) => r.data)
    },
    findAll(active?: boolean): Promise<User[]> {
        return api.get<User[]>('/users', { params: { active } }).then((r) => r.data)
    },
    findById(id: number): Promise<User> {
        return api.get<User>(`/users/${id}`).then((r) => r.data)
    },
    update(id: number, dto: CreateUserDTO): Promise<User> {
        return api.put<User>(`/users/${id}`, dto).then((r) => r.data)
    },
    toggleActive(id: number): Promise<ActiveToggleResult> {
        return api.patch<ActiveToggleResult>(`/users/${id}/active`).then((r) => r.data)
    },
    login(body: { email: string; password: string }): Promise<LoginResponse> {
        return api.post<LoginResponse>('/users/login', body).then((r) => r.data)
    },
}

export const planetService = {
    getAll(): Promise<Planet[]> {
        return api.get<Planet[]>('/planets').then((r) => r.data)
    },
    importPlanets(): Promise<ImportResult> {
        return api.post<ImportResult>('/planets/import').then((r) => r.data)
    },
    create(dto: CreatePlanetDTO): Promise<Planet> {
        return api.post<Planet>('/planets', dto).then((r) => r.data)
    },
    findAll(active?: boolean): Promise<Planet[]> {
        return api.get<Planet[]>('/planets', { params: { active } }).then((r) => r.data)
    },
    findById(id: number): Promise<Planet> {
        return api.get<Planet>(`/planets/${id}`).then((r) => r.data)
    },
    update(id: number, dto: CreatePlanetDTO): Promise<Planet> {
        return api.put<Planet>(`/planets/${id}`, dto).then((r) => r.data)
    },
    toggleActive(id: number): Promise<ActiveToggleResult> {
        return api.patch<ActiveToggleResult>(`/planets/${id}/active`).then((r) => r.data)
    },
}

export const paymentService = {
    findAll(): Promise<Payment[]> {
        return api.get<Payment[]>('/payments').then((r) => r.data)
    },
    findById(id: number): Promise<Payment> {
        return api.get<Payment>(`/payments/${id}`).then((r) => r.data)
    },
    findByRentalId(rentalId: number): Promise<Payment> {
        return api.get<Payment>(`/payments/rental/${rentalId}`).then((r) => r.data)
    },
    pay(id: number, dto: CreatePaymentDTO): Promise<Payment> {
        return api.patch<Payment>(`/payments/${id}/pay`, dto).then((r) => r.data)
    },
    cancel(id: number): Promise<Payment> {
        return api.patch<Payment>(`/payments/${id}/cancel`).then((r) => r.data)
    },
}