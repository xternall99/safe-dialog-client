import { ArrowLeft } from '@phosphor-icons/react'
import { Link, useLocation } from 'react-router-dom'
import styles from './NotFoundPage.module.scss'

export function NotFoundPage() {
  const { pathname } = useLocation()
  const homePath = pathname.startsWith('/preview') ? '/preview/dashboard' : '/dashboard'

  return (
    <main className={styles.page}>
      <p className={styles.code}>404</p>
      <h1>Такой страницы нет</h1>
      <p>Проверьте адрес или вернитесь на главную страницу тренажёра.</p>
      <Link className={styles.link} to={homePath}>
        <ArrowLeft size={18} aria-hidden="true" />
        Вернуться на главную
      </Link>
    </main>
  )
}
