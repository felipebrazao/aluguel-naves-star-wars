import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type AuthUser = {
    id: number
    name: string
    email: string
    role: string
}

type AuthContextValue = {
    user: AuthUser | null
    token: string | null
    login: (user: AuthUser, token: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
    readonly children: ReactNode
}

const TOKEN_STORAGE_KEY = 'token'
const USER_STORAGE_KEY = 'user'

function readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY)

    if (!raw) {
        return null
    }

    try {
        return JSON.parse(raw) as AuthUser
    } catch {
        return null
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))

    const login = (nextUser: AuthUser, nextToken: string) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
        setUser(nextUser)
        setToken(nextToken)
    }

    const logout = () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        localStorage.removeItem(USER_STORAGE_KEY)
        setUser(null)
        setToken(null)
    }

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            token,
            login,
            logout,
        }),
        [user, token],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}
