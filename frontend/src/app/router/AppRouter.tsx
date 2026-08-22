import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PreviewLayout, ProtectedLayout } from './AppLayouts'
import { AdminOnly, AuthOnly, LoadingScreen } from './RouteGuards'

const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then((module) => ({ default: module.DashboardPage })),
)
const AvitoChatIntegrationPage = lazy(() =>
  import('@/pages/integration').then((module) => ({
    default: module.AvitoChatIntegrationPage,
  })),
)
const LessonsPage = lazy(() =>
  import('@/pages/lessons').then((module) => ({ default: module.LessonsPage })),
)
const TheoryPage = lazy(() =>
  import('@/pages/lessons').then((module) => ({ default: module.TheoryPage })),
)
const QuizPage = lazy(() =>
  import('@/pages/lessons').then((module) => ({ default: module.QuizPage })),
)
const SkillCheckPage = lazy(() =>
  import('@/pages/lessons').then((module) => ({ default: module.SkillCheckPage })),
)
const TrainingPage = lazy(() =>
  import('@/pages/training').then((module) => ({ default: module.TrainingPage })),
)
const ChatTrainingPage = lazy(() =>
  import('@/pages/training').then((module) => ({ default: module.ChatTrainingPage })),
)
const ResultPage = lazy(() =>
  import('@/pages/training').then((module) => ({ default: module.ResultPage })),
)
const ProgressPage = lazy(() =>
  import('@/pages/profile').then((module) => ({ default: module.ProgressPage })),
)
const AchievementsPage = lazy(() =>
  import('@/pages/profile').then((module) => ({ default: module.AchievementsPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((module) => ({ default: module.NotFoundPage })),
)
const PreviewRoutes = lazy(() =>
  import('../preview/PreviewRouteAdapters').then((module) => ({
    default: module.PreviewRoutes,
  })),
)
const PreviewAuth = lazy(() =>
  import('../preview/PreviewRouteAdapters').then((module) => ({
    default: module.PreviewAuth,
  })),
)

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<AuthOnly mode="login" />} />
        <Route path="/register" element={<AuthOnly mode="register" />} />

        <Route path="/preview/login" element={<PreviewAuth mode="login" />} />
        <Route path="/preview/register" element={<PreviewAuth mode="register" />} />
        <Route element={<PreviewLayout />}>
          <Route path="/preview/*" element={<PreviewRoutes />} />
        </Route>
        <Route path="/preview" element={<Navigate to="/preview/dashboard" replace />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/admin" element={<AdminOnly />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lessons/:lessonId" element={<TheoryPage />} />
          <Route path="/lessons/:lessonId/quiz" element={<QuizPage />} />
          <Route path="/lessons/:lessonId/skill-check" element={<SkillCheckPage />} />
          <Route path="/chats" element={<TrainingPage />} />
          <Route path="/sessions/:sessionId" element={<ChatTrainingPage />} />
          <Route path="/sessions/:sessionId/result" element={<ResultPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/integration/avito-chat" element={<AvitoChatIntegrationPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
