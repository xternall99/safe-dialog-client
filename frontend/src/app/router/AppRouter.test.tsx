import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createTestStore } from '@/test/createTestStore'
import { AppRouter } from './AppRouter'

describe('AppRouter', () => {
  it('renders a useful 404 page for an unknown route', async () => {
    render(
      <Provider store={createTestStore()}>
        <MemoryRouter initialEntries={['/unknown-route']}>
          <AppRouter />
        </MemoryRouter>
      </Provider>,
    )

    expect(await screen.findByRole('heading', { name: 'Такой страницы нет' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Вернуться на главную' })).toHaveAttribute(
      'href',
      '/dashboard',
    )
  })
})
