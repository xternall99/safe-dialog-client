import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentAccount, useGetMeQuery } from '@/entities/user'
import { AuthPage } from '@/pages/auth'
import { ErrorState } from '@/shared/error-state'
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/http-error'
import styles from '../App.module.scss'

const AdminPage = lazy(() =>
  import('@/pages/admin').then((module) => ({ default: module.AdminPage })),
)

export function LoadingScreen() {
  return (
    <div className={styles.splash} role="status" aria-live="polite">
      Загружаем тренажёр безопасности…
    </div>
  )
}

export function AuthOnly({ mode }: { mode: 'login' | 'register' }) {
  const { data: account, isLoading, error, refetch } = useGetMeQuery()

  if (isLoading) return <LoadingScreen />
  if (error && getApiErrorStatus(error) !== 401) {
    return <ErrorState message={getApiErrorMessage(error)} onRetry={refetch} />
  }

  return account ? (
    <Navigate to={account.accessRole === 'admin' ? '/admin' : '/dashboard'} replace />
  ) : (
    <AuthPage mode={mode} />
  )
}

export function AdminOnly() {
  const { account } = useCurrentAccount()

  return account.accessRole === 'admin' ? (
    <Suspense fallback={<LoadingScreen />}>
      <AdminPage />
    </Suspense>
  ) : (
    <Navigate to="/dashboard" replace />
  )
}
