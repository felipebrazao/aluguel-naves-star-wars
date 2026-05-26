export interface User {
    id: number
    name: string
    email: string
    cpf: string
    role: string
    active: boolean
}

export interface Spaceship {
    id: number
    name: string
    model: string
    manufacturer: string
    capacity: number
    dailyPrice: number | string
    status: string
    active: boolean
}

export interface Planet {
    id: number
    name: string
    diameter?: number
    climate?: string
    terrain?: string
    active: boolean
}

export interface Rental {
    id: number
    userId: number
    spaceshipId: number
    spaceshipName: string
    status: string
    pickupPlanetName: string
    returnPlanetName: string
    startDate: string
    endDate: string
    totalPrice: number
}

export interface CreateUserDTO {
    name: string
    email: string
    cpf: string
    role: string
}

export interface CreateRentalDTO {
    userId: number
    spaceshipId: number
    pickupPlanetName: string
    returnPlanetName: string
    startDate: string
    endDate: string
}