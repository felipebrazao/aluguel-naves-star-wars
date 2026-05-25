import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../../../components/ProtectedRoute'

function renderProtected(token?: string, user?: object, role?: 'Admin' | 'Cliente') {
    if (token) localStorage.setItem('token', token)
    if (user) localStorage.setItem('user', JSON.stringify(user))

    return render(
        <MemoryRouter initialEntries={['/protegido']}>
            <ProtectedRoute role={role}>
                <p>Conteúdo protegido</p>
            </ProtectedRoute>
        </MemoryRouter>,
    )
}

describe('ProtectedRoute', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('should redirect and not render children when no token is present', () => {
        renderProtected()
        expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
    })

    it('should render children when token exists and no role is required', () => {
        renderProtected('fake-token')
        expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
    })

    it('should redirect when required role does not match user role', () => {
        renderProtected('fake-token', { role: 'Cliente' }, 'Admin')
        expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
    })

    it('should render children when required role matches user role', () => {
        renderProtected('fake-token', { role: 'Admin' }, 'Admin')
        expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
    })

    it('should handle case-insensitive role matching', () => {
        renderProtected('fake-token', { role: 'admin' }, 'Admin')
        expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
    })

    it('should redirect when token exists but user has no matching role', () => {
        renderProtected('fake-token', { role: 'Cliente' }, 'Admin')
        expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
    })
})
