export type SpaceshipStatus = 'disponivel' | 'alugada' | 'manutencao' | 'desativada'

export interface User {
    id: number
    swapiId: number
    name: string
    email: string
    cpf: string
    role: string
    active: boolean
    createdAt: string
}

export interface Spaceship {
    id: number
    name: string
    model: string
    manufacturer: string
    costInCredits: number
    capacity: number
    dailyPrice: number | string
    status: SpaceshipStatus
    active: boolean
}

export interface Planet {
    id: number
    swapiId: number
    name: string
    diameter?: number
    climate?: string
    terrain?: string
    population: number
    active: boolean
}

export interface Rental {
    id: number
    userId: number
    spaceshipId: number
    spaceshipName: string
    status: string
    pickupPlanetId: number
    pickupPlanetName: string
    returnPlanetId: number
    returnPlanetName: string
    startDate: string
    endDate: string
    actualPickupDate: string | null
    actualReturnDate: string | null
    totalPrice: number
    createdAt: string
}

export interface Payment {
    id: number
    rentalId: number
    amount: number
    paymentMethod: string
    status: string
    paidAt: string | null
    createdAt: string
}

export interface CreateUserDTO {
    name: string
    email: string
    cpf: string
    password: string
    roleId: number
}

export interface CreateRentalDTO {
    userId: number
    spaceshipId: number
    pickupPlanetId: number
    returnPlanetId: number
    startDate: string
    endDate: string
    paymentMethodId: number
}

export interface CreatePaymentDTO {
    paymentMethodId: number
}

export interface CreateSpaceshipDTO {
    name: string
    model: string
    manufacturer: string
    capacity: number
    costInCredits: number
}

export interface CreatePlanetDTO {
    name: string
    diameter?: number
    climate?: string
    terrain?: string
    population?: number
}