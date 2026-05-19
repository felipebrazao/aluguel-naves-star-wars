import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import App from '../../App'

describe('App Component', () => {
  describe('Render', () => {
    it('should render the hero section with logos', () => {
      render(<App />)

      expect(screen.getByAltText('React logo')).toBeInTheDocument()
      expect(screen.getByAltText('Vite logo')).toBeInTheDocument()
    })

    it('should render the main heading', () => {
      render(<App />)

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Get started')
    })

    it('should render the counter button with initial count of 0', () => {
      render(<App />)

      const button = screen.getByRole('button', { name: /count is 0/i })
      expect(button).toBeInTheDocument()
    })

    it('should render documentation section', () => {
      render(<App />)

      expect(screen.getByRole('heading', { level: 2, name: 'Documentation' })).toBeInTheDocument()
      expect(screen.getByText('Your questions, answered')).toBeInTheDocument()
    })

    it('should render connect section', () => {
      render(<App />)

      expect(screen.getByRole('heading', { level: 2, name: 'Connect with us' })).toBeInTheDocument()
      expect(screen.getByText('Join the Vite community')).toBeInTheDocument()
    })

    it('should render all external links', () => {
      render(<App />)

      expect(screen.getByRole('link', { name: /explore vite/i })).toHaveAttribute('href', 'https://vite.dev/')
      expect(screen.getByRole('link', { name: /learn more/i })).toHaveAttribute('href', 'https://react.dev/')
      expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute('href', 'https://github.com/vitejs/vite')
    })
  })

  describe('Interaction', () => {
    it('should increment count when button is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      const button = screen.getByRole('button', { name: /count is 0/i })

      await user.click(button)

      expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument()
    })

    it('should increment count multiple times when button is clicked multiple times', async () => {
      const user = userEvent.setup()
      render(<App />)

      const button = screen.getByRole('button')

      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(screen.getByRole('button', { name: /count is 3/i })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button with correct type', () => {
      render(<App />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should have presentation-only icons with correct aria attributes', () => {
      render(<App />)

      const icons = screen.getAllByRole('presentation')
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })
})
