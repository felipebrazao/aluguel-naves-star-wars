import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import Tabs from '../../../../components/shared/Tabs'

const tabs = [
    { label: 'Aba 1', content: <div>Conteúdo 1</div>, id: 'tab-1' },
    { label: 'Aba 2', content: <div>Conteúdo 2</div>, id: 'tab-2' },
    { label: 'Aba 3', content: <div>Conteúdo 3</div>, id: 'tab-3' },
]

describe('Tabs', () => {
    it('should render all tab labels', () => {
        render(<Tabs tabs={tabs} />)
        expect(screen.getByRole('tab', { name: 'Aba 1' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Aba 2' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Aba 3' })).toBeInTheDocument()
    })

    it('should show first tab panel without hidden class by default', () => {
        render(<Tabs tabs={tabs} />)
        expect(screen.getByText('Conteúdo 1').closest('[role="tabpanel"]')).not.toHaveClass('hidden')
    })

    it('should hide other tab panels by default', () => {
        render(<Tabs tabs={tabs} />)
        expect(screen.getByText('Conteúdo 2').closest('[role="tabpanel"]')).toHaveClass('hidden')
        expect(screen.getByText('Conteúdo 3').closest('[role="tabpanel"]')).toHaveClass('hidden')
    })

    it('should show the tab panel matching initialTab', () => {
        render(<Tabs tabs={tabs} initialTab={1} />)
        expect(screen.getByText('Conteúdo 2').closest('[role="tabpanel"]')).not.toHaveClass('hidden')
        expect(screen.getByText('Conteúdo 1').closest('[role="tabpanel"]')).toHaveClass('hidden')
    })

    it('should switch content when a tab is clicked', async () => {
        const user = userEvent.setup()
        render(<Tabs tabs={tabs} />)
        await user.click(screen.getByRole('tab', { name: 'Aba 2' }))
        expect(screen.getByText('Conteúdo 2').closest('[role="tabpanel"]')).not.toHaveClass('hidden')
        expect(screen.getByText('Conteúdo 1').closest('[role="tabpanel"]')).toHaveClass('hidden')
    })

    it('should mark first tab as selected by default', () => {
        render(<Tabs tabs={tabs} />)
        expect(screen.getByRole('tab', { name: 'Aba 1' })).toHaveAttribute('aria-selected', 'true')
    })

    it('should update aria-selected when switching tabs', async () => {
        const user = userEvent.setup()
        render(<Tabs tabs={tabs} />)
        await user.click(screen.getByRole('tab', { name: 'Aba 2' }))
        expect(screen.getByRole('tab', { name: 'Aba 2' })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('tab', { name: 'Aba 1' })).toHaveAttribute('aria-selected', 'false')
    })
})
