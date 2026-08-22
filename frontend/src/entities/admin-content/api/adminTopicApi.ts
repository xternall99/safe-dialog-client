import { api, apiTags } from '@/shared/http-client'
import {
  adminQuizOptionDtoSchema,
  adminQuizQuestionDtoSchema,
  adminTheoryBlockDtoSchema,
  adminTopicDtoSchema,
  type AdminQuizOptionDto,
  type AdminQuizQuestionDto,
  type AdminTheoryBlockDto,
  type AdminTopicDto,
} from './contracts'
import {
  mapAdminTopic,
  mapAdminTopicDto,
  mapQuizOption,
  mapQuizOptionDto,
  mapQuizQuestion,
  mapQuizQuestionDto,
  mapTheoryBlock,
  mapTheoryBlockDto,
} from '../lib/mappers'
import type {
  AdminQuizOption,
  AdminQuizQuestion,
  AdminTheoryBlock,
  AdminTopic,
  AdminTopicDraft,
} from '../model/types'

interface TopicItem<T> {
  topicId: number
  value: T
}

interface TopicNestedItem<T> extends TopicItem<T> {
  itemId: number
}

interface QuizOptionItem extends TopicItem<AdminQuizOption> {
  questionId: number
}

interface QuizOptionNestedItem extends QuizOptionItem {
  optionId: number
}

const emptyResponse = { responseHandler: 'text' as const }

export const adminTopicApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAdminTopics: build.query<AdminTopic[], void>({
      query: () => '/admin/topics',
      transformResponse: (response: AdminTopicDto[]) =>
        adminTopicDtoSchema.array().parse(response).map(mapAdminTopic),
      providesTags: [apiTags.adminTopics],
    }),
    getAdminTopic: build.query<AdminTopic, number>({
      query: (id) => `/admin/topics/${id}`,
      transformResponse: (response: AdminTopicDto) =>
        mapAdminTopic(adminTopicDtoSchema.parse(response)),
      providesTags: (_result, _error, id) => [{ type: apiTags.adminTopics, id }],
    }),
    createAdminTopic: build.mutation<AdminTopic, AdminTopicDraft>({
      query: (value) => ({ url: '/admin/topics', method: 'POST', body: mapAdminTopicDto(value) }),
      transformResponse: (response: AdminTopicDto) =>
        mapAdminTopic(adminTopicDtoSchema.parse(response)),
      invalidatesTags: [apiTags.adminTopics],
    }),
    updateAdminTopic: build.mutation<void, TopicItem<AdminTopicDraft>>({
      query: ({ topicId, value }) => ({
        url: `/admin/topics/${topicId}`,
        method: 'PUT',
        body: mapAdminTopicDto(value),
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminTopics],
    }),
    changeAdminTopicStatus: build.mutation<
      void,
      { topicId: number; action: 'publish' | 'deactivate' | 'restore' | 'archive' }
    >({
      query: ({ topicId, action }) => ({
        url:
          action === 'archive' ? `/admin/topics/${topicId}` : `/admin/topics/${topicId}/${action}`,
        method: action === 'archive' ? 'DELETE' : 'POST',
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminTopics],
    }),
    createAdminTheoryBlock: build.mutation<AdminTheoryBlock, TopicItem<AdminTheoryBlock>>({
      query: ({ topicId, value }) => ({
        url: `/admin/topics/${topicId}/theory-blocks`,
        method: 'POST',
        body: mapTheoryBlockDto(value),
      }),
      transformResponse: (response: AdminTheoryBlockDto) =>
        mapTheoryBlock(adminTheoryBlockDtoSchema.parse(response)),
      invalidatesTags: [apiTags.adminTopics],
    }),
    updateAdminTheoryBlock: build.mutation<void, TopicNestedItem<AdminTheoryBlock>>({
      query: ({ topicId, itemId, value }) => ({
        url: `/admin/topics/${topicId}/theory-blocks/${itemId}`,
        method: 'PUT',
        body: mapTheoryBlockDto(value),
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminTopics],
    }),
    deleteAdminTheoryBlock: build.mutation<void, { topicId: number; itemId: number }>({
      query: ({ topicId, itemId }) => ({
        url: `/admin/topics/${topicId}/theory-blocks/${itemId}`,
        method: 'DELETE',
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminTopics],
    }),
    createAdminQuizQuestion: build.mutation<AdminQuizQuestion, TopicItem<AdminQuizQuestion>>({
      query: ({ topicId, value }) => ({
        url: `/admin/topics/${topicId}/quiz-questions`,
        method: 'POST',
        body: mapQuizQuestionDto(value),
      }),
      transformResponse: (response: AdminQuizQuestionDto) =>
        mapQuizQuestion(adminQuizQuestionDtoSchema.parse(response)),
      invalidatesTags: [apiTags.adminTopics],
    }),
    updateAdminQuizQuestion: build.mutation<void, TopicNestedItem<AdminQuizQuestion>>({
      query: ({ topicId, itemId, value }) => ({
        url: `/admin/topics/${topicId}/quiz-questions/${itemId}`,
        method: 'PUT',
        body: mapQuizQuestionDto(value),
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminTopics],
    }),
    deleteAdminQuizQuestion: build.mutation<void, { topicId: number; itemId: number }>({
      query: ({ topicId, itemId }) => ({
        url: `/admin/topics/${topicId}/quiz-questions/${itemId}`,
        method: 'DELETE',
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminTopics],
    }),
    createAdminQuizOption: build.mutation<AdminQuizOption, QuizOptionItem>({
      query: ({ topicId, questionId, value }) => ({
        url: `/admin/topics/${topicId}/quiz-questions/${questionId}/options`,
        method: 'POST',
        body: mapQuizOptionDto(value),
      }),
      transformResponse: (response: AdminQuizOptionDto) =>
        mapQuizOption(adminQuizOptionDtoSchema.parse(response)),
      invalidatesTags: [apiTags.adminTopics],
    }),
    updateAdminQuizOption: build.mutation<void, QuizOptionNestedItem>({
      query: ({ topicId, questionId, optionId, value }) => ({
        url: `/admin/topics/${topicId}/quiz-questions/${questionId}/options/${optionId}`,
        method: 'PUT',
        body: mapQuizOptionDto(value),
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminTopics],
    }),
    deleteAdminQuizOption: build.mutation<
      void,
      { topicId: number; questionId: number; optionId: number }
    >({
      query: ({ topicId, questionId, optionId }) => ({
        url: `/admin/topics/${topicId}/quiz-questions/${questionId}/options/${optionId}`,
        method: 'DELETE',
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminTopics],
    }),
  }),
})

export const {
  useGetAdminTopicsQuery,
  useGetAdminTopicQuery,
  useCreateAdminTopicMutation,
  useUpdateAdminTopicMutation,
  useChangeAdminTopicStatusMutation,
  useCreateAdminTheoryBlockMutation,
  useUpdateAdminTheoryBlockMutation,
  useDeleteAdminTheoryBlockMutation,
  useCreateAdminQuizQuestionMutation,
  useUpdateAdminQuizQuestionMutation,
  useDeleteAdminQuizQuestionMutation,
  useCreateAdminQuizOptionMutation,
  useUpdateAdminQuizOptionMutation,
  useDeleteAdminQuizOptionMutation,
} = adminTopicApi
