import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestStore } from '@/test/createTestStore'
import { ProtectedLayout } from './AppLayouts'

const accountQuery = vi.hoisted(() => ({
  current: {} as {
    data?: {
      id: number
      username: string
      accessRole: 'user' | 'admin'
      trainingRole: 'buyer' | 'seller'
      streak: { current: number; longest: number; isActiveToday: boolean }
    }
    isLoading: boolean
    error?: { status: number; data?: unknown }
    refetch: ReturnType<typeof vi.fn>
  },
}))

vi.mock('@/entities/user', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/user')>()

  return {
    ...actual,
    useGetMeQuery: () => accountQuery.current,
    useUpdateTrainingRoleMutation: () => [vi.fn()],
  }
})

function renderProtectedRoute() {
  return render(
    <Provider store={createTestStore()}>
      <MemoryRouter initialEntries={['/preview-protected']}>
        <Routes>
          <Route element={<ProtectedLayout />}>
            <Route path="/preview-protected" element={<p>Защищённая страница</p>} />
          </Route>
          <Route path="/login" element={<p>Страница входа</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('ProtectedLayout', () => {
  beforeEach(() => {
    accountQuery.current = {
      isLoading: false,
      refetch: vi.fn(),
    }
  })

  it('redirects an unauthenticated user to login', async () => {
    accountQuery.current.error = { status: 401 }

    renderProtectedRoute()

    expect(await screen.findByText('Страница входа')).toBeInTheDocument()
  })

  it('renders the protected content for an authenticated user', async () => {
    accountQuery.current.data = {
      id: 7,
      username: 'Ирина',
      accessRole: 'user',
      trainingRole: 'buyer',
      streak: { current: 3, longest: 5, isActiveToday: true },
    }

    renderProtectedRoute()

    expect(await screen.findByText('Защищённая страница')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Основная навигация' })).toBeInTheDocument()
  })

  it('shows a safe error state when the account request fails', async () => {
    accountQuery.current.error = {
      status: 500,
      data: {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Сервис временно недоступен',
          details: {},
          request_id: 'request-500',
        },
      },
    }

    renderProtectedRoute()

    expect(await screen.findByRole('alert')).toHaveTextContent('Сервис временно недоступен')
    expect(screen.queryByText('Защищённая страница')).not.toBeInTheDocument()
  })
})
