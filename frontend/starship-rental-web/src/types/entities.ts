export type AuthUser = {
    id: number
    name: string
    email: string
    role: string
}

export type LoginResponse = {
    token: string
    user: AuthUser
}

export type UserResponseDTO = {
    id: number
    swapiId: number | null
    name: string
    email: string
    cpf: string
    role: string
    active: boolean
    createdAt: string
}

export type SpaceshipResponseDTO = {
    id: number
    name: string
    model: string
    manufacturer: string
    costInCredits: string | null
    capacity: number
    dailyPrice: string
    status: string
    active: boolean
}

export type PlanetResponseDTO = {
    id: number
    swapiId: number | null
    name: string
    diameter: number | null
    climate: string | null
    terrain: string | null
    population: number | null
    active: boolean
}

export type PaymentMethod = {
    id: number
    name: string
}

export type RentalResponseDTO = {
    id: number
    userId: number
    userName: string
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
    totalPrice: string
    createdAt: string
}

export type PaymentResponseDTO = {
    id: number
    rentalId: number
    status: string
    amount: string
    paymentMethod: string
    paidAt: string | null
    createdAt: string
}

export type RentalRequestDTO = {
    userId: number
    spaceshipId: number
    pickupPlanetId: number
    returnPlanetId: number
    paymentMethodId: number
    startDate: string
    endDate: string
}