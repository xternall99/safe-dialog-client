import { Route, Routes, useParams } from 'react-router-dom'
import { useCurrentAccount } from '@/entities/user'
import { AuthPage } from '@/pages/auth'
import { DashboardPage } from '@/pages/dashboard'
import { LessonsPage, QuizPage, SkillCheckPage, TheoryPage } from '@/pages/lessons'
import { NotFoundPage } from '@/pages/not-found'
import { AchievementsPage, ProgressPage } from '@/pages/profile'
import { ChatTrainingPage, ResultPage, TrainingPage } from '@/pages/training'
import { PreviewModeProvider } from '@/shared/runtime-mode'
import {
  createPreviewDashboard,
  createPreviewProgress,
  createPreviewTheory,
  createPreviewTrainingTopics,
  createPreviewTopics,
  previewFreePlaySession,
  previewAchievements,
  previewLevels,
  previewQuiz,
  previewQuizOutcome,
  previewResult,
  previewSession,
  previewSkillCheck,
} from './data'

export function PreviewAuth({ mode }: { mode: 'login' | 'register' }) {
  return (
    <PreviewModeProvider>
      <AuthPage mode={mode} />
    </PreviewModeProvider>
  )
}

export function PreviewDashboardRoute() {
  const { account } = useCurrentAccount()
  return <DashboardPage previewDashboard={createPreviewDashboard(account.trainingRole)} />
}

export function PreviewLessonsRoute() {
  const { account } = useCurrentAccount()
  return <LessonsPage previewTopics={createPreviewTopics(account.trainingRole)} />
}

function usePreviewTopicId() {
  const { account } = useCurrentAccount()
  const { lessonId } = useParams()
  const topics = createPreviewTopics(account.trainingRole)
  const topic = topics.find((item) => String(item.id) === lessonId || item.slug === lessonId)

  return { role: account.trainingRole, topicId: topic?.id }
}

export function PreviewTheoryRoute() {
  const { role, topicId } = usePreviewTopicId()
  return <TheoryPage previewTheory={createPreviewTheory(role, topicId)} />
}

export function PreviewQuizRoute() {
  const { topicId } = usePreviewTopicId()

  return (
    <QuizPage
      previewQuiz={previewQuiz}
      previewOutcome={previewQuizOutcome}
      previewTopicId={topicId ?? 1}
    />
  )
}

export function PreviewTrainingRoute() {
  const { account } = useCurrentAccount()

  return (
    <TrainingPage
      preview={{
        topics: createPreviewTrainingTopics(account.trainingRole),
        levels: previewLevels,
        session: previewSession,
        result: previewResult,
      }}
    />
  )
}

export function PreviewProgressRoute() {
  const { account } = useCurrentAccount()
  return <ProgressPage previewProgress={createPreviewProgress(account.trainingRole)} />
}

export function PreviewChatRoute() {
  const { sessionId } = useParams()
  const session = sessionId === 'free-play' ? previewFreePlaySession : previewSession

  return <ChatTrainingPage preview={{ session, result: previewResult }} />
}

export function PreviewRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<PreviewDashboardRoute />} />
      <Route path="lessons" element={<PreviewLessonsRoute />} />
      <Route path="lessons/:lessonId" element={<PreviewTheoryRoute />} />
      <Route path="lessons/:lessonId/quiz" element={<PreviewQuizRoute />} />
      <Route
        path="lessons/:lessonId/skill-check"
        element={<SkillCheckPage preview={previewSkillCheck} />}
      />
      <Route path="chats" element={<PreviewTrainingRoute />} />
      <Route path="sessions/:sessionId" element={<PreviewChatRoute />} />
      <Route
        path="sessions/:sessionId/result"
        element={<ResultPage previewResult={previewResult} />}
      />
      <Route path="progress" element={<PreviewProgressRoute />} />
      <Route
        path="achievements"
        element={<AchievementsPage previewAchievements={previewAchievements} />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
