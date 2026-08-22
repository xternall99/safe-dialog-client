import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '@/pages/dashboard'
import { AvitoChatIntegrationPage } from '@/pages/integration'
import { LessonsPage, QuizPage, SkillCheckPage, TheoryPage } from '@/pages/lessons'
import { AchievementsPage, ProgressPage } from '@/pages/profile'
import { ChatTrainingPage, ResultPage, TrainingPage } from '@/pages/training'
import { previewAchievements, previewResult, previewSkillCheck } from '../preview/data'
import {
  PreviewAuth,
  PreviewChatRoute,
  PreviewDashboardRoute,
  PreviewLessonsRoute,
  PreviewProgressRoute,
  PreviewQuizRoute,
  PreviewTheoryRoute,
  PreviewTrainingRoute,
} from '../preview/PreviewRouteAdapters'
import { PreviewLayout, ProtectedLayout } from './AppLayouts'
import { AdminOnly, AuthOnly } from './RouteGuards'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<AuthOnly mode="login" />} />
      <Route path="/register" element={<AuthOnly mode="register" />} />

      <Route path="/preview/login" element={<PreviewAuth mode="login" />} />
      <Route path="/preview/register" element={<PreviewAuth mode="register" />} />
      <Route element={<PreviewLayout />}>
        <Route path="/preview/dashboard" element={<PreviewDashboardRoute />} />
        <Route path="/preview/lessons" element={<PreviewLessonsRoute />} />
        <Route path="/preview/lessons/:lessonId" element={<PreviewTheoryRoute />} />
        <Route path="/preview/lessons/:lessonId/quiz" element={<PreviewQuizRoute />} />
        <Route
          path="/preview/lessons/:lessonId/skill-check"
          element={<SkillCheckPage preview={previewSkillCheck} />}
        />
        <Route path="/preview/chats" element={<PreviewTrainingRoute />} />
        <Route path="/preview/sessions/:sessionId" element={<PreviewChatRoute />} />
        <Route
          path="/preview/sessions/:sessionId/result"
          element={<ResultPage previewResult={previewResult} />}
        />
        <Route path="/preview/progress" element={<PreviewProgressRoute />} />
        <Route
          path="/preview/achievements"
          element={<AchievementsPage previewAchievements={previewAchievements} />}
        />
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

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
