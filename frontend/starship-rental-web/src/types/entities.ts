export interface User {
    id: string
    name: string
    email: string
    role: 'Admin' | 'Cliente'
}

export interface Spaceship {
    id: string
    name: string
    model: string
    daily_price: number
    status: 'DISPONIVEL' | 'MANUTENCAO'
    capacity: number
}

export interface Location {
    id: string
    name: string
    planet: string
}

export interface Rental {
    id: string
    spaceship_id: string
    start_date: string
    end_date: string
    pickup_location: string
    dropoff_location: string
    total_price: number
    status: 'ATIVO' | 'EM_USO' | 'FINALIZADO'
}