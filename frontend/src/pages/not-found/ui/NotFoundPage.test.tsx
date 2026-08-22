import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NotFoundPage } from './NotFoundPage'

describe('NotFoundPage', () => {
  it('returns a preview user to the preview dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/preview/unknown']}>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Такой страницы нет' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Вернуться на главную' })).toHaveAttribute(
      'href',
      '/preview/dashboard',
    )
  })
})
