import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Router from '../../Router'

function renderRouter(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Router />
        </MemoryRouter>,
    )
}

describe('Router', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('should render login page at /login', () => {
        renderRouter('/login')
        expect(screen.getByRole('heading', { name: /star rental access/i })).toBeInTheDocument()
    })

    it('should redirect to /login when accessing / without a token', () => {
        renderRouter('/')
        expect(screen.getByRole('heading', { name: /star rental access/i })).toBeInTheDocument()
    })

    it('should render home page at / when authenticated', () => {
        localStorage.setItem('token', 'fake-token')
        renderRouter('/')
        expect(screen.getByText('Catálogo de Naves')).toBeInTheDocument()
    })
})
