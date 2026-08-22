import { useParams } from 'react-router-dom'
import { useCurrentAccount } from '@/entities/user'
import { AuthPage } from '@/pages/auth'
import { DashboardPage } from '@/pages/dashboard'
import { LessonsPage, QuizPage, TheoryPage } from '@/pages/lessons'
import { ProgressPage } from '@/pages/profile'
import { ChatTrainingPage, TrainingPage } from '@/pages/training'
import { PreviewModeProvider } from '@/shared/runtime-mode'
import {
  createPreviewDashboard,
  createPreviewProgress,
  createPreviewTheory,
  createPreviewTrainingTopics,
  createPreviewTopics,
  previewFreePlaySession,
  previewLevels,
  previewQuiz,
  previewQuizOutcome,
  previewResult,
  previewSession,
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
