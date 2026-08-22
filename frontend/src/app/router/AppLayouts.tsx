import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import {
  CurrentAccountProvider,
  useGetMeQuery,
  useUpdateTrainingRoleMutation,
  type Account,
  type UserRole,
} from '@/entities/user'
import { PreviewModeProvider } from '@/shared/runtime-mode'
import { ErrorState } from '@/shared/error-state'
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/http-error'
import { AppHeader } from '@/widgets/app-header'
import { previewAccount } from '../preview/data'
import styles from '../App.module.scss'
import { LoadingScreen } from './RouteGuards'

function ApplicationShell({ account, basePath }: { account: Account; basePath?: string }) {
  return (
    <div>
      <a className={styles.skipLink} href="#main-content">
        Перейти к содержимому
      </a>
      <AppHeader account={account} basePath={basePath} />
      <main className={styles.page} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}

export function ProtectedLayout() {
  const { data: account, isLoading, error, refetch } = useGetMeQuery()
  const [updateRole] = useUpdateTrainingRoleMutation()

  if (isLoading) return <LoadingScreen />
  if (getApiErrorStatus(error) === 401 || (!error && !account)) {
    return <Navigate to="/login" replace />
  }
  if (error) return <ErrorState message={getApiErrorMessage(error)} onRetry={refetch} />

  const changeTrainingRole = async (role: UserRole) => {
    await updateRole(role).unwrap()
  }

  return (
    <CurrentAccountProvider value={{ account, changeTrainingRole }}>
      <ApplicationShell account={account} />
    </CurrentAccountProvider>
  )
}

export function PreviewLayout() {
  const [account, setAccount] = useState<Account>(previewAccount)
  const changeTrainingRole = async (role: UserRole) => {
    setAccount((current) => ({ ...current, trainingRole: role }))
  }

  return (
    <PreviewModeProvider>
      <CurrentAccountProvider value={{ account, changeTrainingRole }}>
        <ApplicationShell account={account} basePath="/preview" />
      </CurrentAccountProvider>
    </PreviewModeProvider>
  )
}
