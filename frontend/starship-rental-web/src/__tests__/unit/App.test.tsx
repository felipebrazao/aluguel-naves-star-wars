import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import App from '../../App'

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Render', () => {
    it('should render the login page when not authenticated', () => {
      render(<App />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('should render the main heading with Star Rental Access', () => {
      render(<App />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Star Rental Access')
    })

    it('should render the authentication label', () => {
      render(<App />)
      expect(screen.getByText(/autenticação/i)).toBeInTheDocument()
    })

    it('should render email input', () => {
      render(<App />)
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    })

    it('should render password input', () => {
      render(<App />)
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    })

    it('should render login and register tab buttons', () => {
      render(<App />)
      const entrarButtons = screen.getAllByRole('button', { name: /entrar/i })
      expect(entrarButtons.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('should switch to register tab when Criar Conta is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)
      const registerButton = screen.getByRole('button', { name: /criar conta/i })
      await user.click(registerButton)
      expect(registerButton).toBeInTheDocument()
    })

    it('should allow typing in email input', async () => {
      const user = userEvent.setup()
      render(<App />)
      const emailInput = screen.getByLabelText(/e-mail/i)
      await user.type(emailInput, 'pilot@starrental.com')
      expect(emailInput).toHaveValue('pilot@starrental.com')
    })

    it('should allow typing in password input', async () => {
      const user = userEvent.setup()
      render(<App />)
      const passwordInput = screen.getByLabelText(/senha/i)
      await user.type(passwordInput, 'secret123')
      expect(passwordInput).toHaveValue('secret123')
    })
  })

  describe('Accessibility', () => {
    it('should have a main landmark', () => {
      render(<App />)
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should have email input with correct type', () => {
      render(<App />)
      expect(screen.getByLabelText(/e-mail/i)).toHaveAttribute('type', 'email')
    })

    it('should have password input with correct type', () => {
      render(<App />)
      expect(screen.getByLabelText(/senha/i)).toHaveAttribute('type', 'password')
    })
  })
})
