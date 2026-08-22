import { api, apiTags } from '@/shared/http-client'
import {
  adminScenarioDtoSchema,
  adminScenarioOptionDtoSchema,
  adminScenarioStepDtoSchema,
  type AdminScenarioDto,
  type AdminScenarioOptionDto,
  type AdminScenarioStepDto,
} from './contracts'
import {
  mapAdminScenario,
  mapAdminScenarioDto,
  mapScenarioOption,
  mapScenarioOptionDto,
  mapScenarioStep,
  mapScenarioStepDto,
} from '../lib/mappers'
import type {
  AdminScenario,
  AdminScenarioDraft,
  AdminScenarioOption,
  AdminScenarioStep,
} from '../model/types'

interface ScenarioItem<T> {
  scenarioId: number
  value: T
}

interface ScenarioNestedItem<T> extends ScenarioItem<T> {
  itemId: number
}

interface StepOptionItem {
  stepId: number
  value: AdminScenarioOption
}

interface StepOptionNestedItem extends StepOptionItem {
  optionId: number
}

const emptyResponse = { responseHandler: 'text' as const }

export const adminScenarioApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAdminScenarios: build.query<AdminScenario[], void>({
      query: () => '/admin/scenarios',
      transformResponse: (response: AdminScenarioDto[]) =>
        adminScenarioDtoSchema.array().parse(response).map(mapAdminScenario),
      providesTags: [apiTags.adminScenarios],
    }),
    createAdminScenario: build.mutation<AdminScenario, AdminScenarioDraft>({
      query: (value) => ({
        url: '/admin/scenarios',
        method: 'POST',
        body: mapAdminScenarioDto(value),
      }),
      transformResponse: (response: AdminScenarioDto) =>
        mapAdminScenario(adminScenarioDtoSchema.parse(response)),
      invalidatesTags: [apiTags.adminScenarios],
    }),
    updateAdminScenario: build.mutation<void, ScenarioItem<AdminScenarioDraft>>({
      query: ({ scenarioId, value }) => ({
        url: `/admin/scenarios/${scenarioId}`,
        method: 'PUT',
        body: mapAdminScenarioDto(value),
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminScenarios],
    }),
    changeAdminScenarioStatus: build.mutation<
      void,
      { scenarioId: number; action: 'publish' | 'deactivate' | 'restore' | 'archive' }
    >({
      query: ({ scenarioId, action }) => ({
        url:
          action === 'archive'
            ? `/admin/scenarios/${scenarioId}`
            : `/admin/scenarios/${scenarioId}/${action}`,
        method: action === 'archive' ? 'DELETE' : 'POST',
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminScenarios],
    }),
    createAdminScenarioStep: build.mutation<AdminScenarioStep, ScenarioItem<AdminScenarioStep>>({
      query: ({ scenarioId, value }) => ({
        url: `/admin/scenarios/${scenarioId}/steps`,
        method: 'POST',
        body: mapScenarioStepDto(value),
      }),
      transformResponse: (response: AdminScenarioStepDto) =>
        mapScenarioStep(adminScenarioStepDtoSchema.parse(response)),
      invalidatesTags: [apiTags.adminScenarios],
    }),
    updateAdminScenarioStep: build.mutation<void, ScenarioNestedItem<AdminScenarioStep>>({
      query: ({ scenarioId, itemId, value }) => ({
        url: `/admin/scenarios/${scenarioId}/steps/${itemId}`,
        method: 'PUT',
        body: mapScenarioStepDto(value),
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminScenarios],
    }),
    deleteAdminScenarioStep: build.mutation<void, { scenarioId: number; itemId: number }>({
      query: ({ scenarioId, itemId }) => ({
        url: `/admin/scenarios/${scenarioId}/steps/${itemId}`,
        method: 'DELETE',
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminScenarios],
    }),
    createAdminScenarioOption: build.mutation<AdminScenarioOption, StepOptionItem>({
      query: ({ stepId, value }) => ({
        url: `/admin/steps/${stepId}/options`,
        method: 'POST',
        body: mapScenarioOptionDto(value),
      }),
      transformResponse: (response: AdminScenarioOptionDto) =>
        mapScenarioOption(adminScenarioOptionDtoSchema.parse(response)),
      invalidatesTags: [apiTags.adminScenarios],
    }),
    updateAdminScenarioOption: build.mutation<void, StepOptionNestedItem>({
      query: ({ stepId, optionId, value }) => ({
        url: `/admin/steps/${stepId}/options/${optionId}`,
        method: 'PUT',
        body: mapScenarioOptionDto(value),
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminScenarios],
    }),
    deleteAdminScenarioOption: build.mutation<void, { stepId: number; optionId: number }>({
      query: ({ stepId, optionId }) => ({
        url: `/admin/steps/${stepId}/options/${optionId}`,
        method: 'DELETE',
        ...emptyResponse,
      }),
      invalidatesTags: [apiTags.adminScenarios],
    }),
  }),
})

export const {
  useGetAdminScenariosQuery,
  useCreateAdminScenarioMutation,
  useUpdateAdminScenarioMutation,
  useChangeAdminScenarioStatusMutation,
  useCreateAdminScenarioStepMutation,
  useUpdateAdminScenarioStepMutation,
  useDeleteAdminScenarioStepMutation,
  useCreateAdminScenarioOptionMutation,
  useUpdateAdminScenarioOptionMutation,
  useDeleteAdminScenarioOptionMutation,
} = adminScenarioApi
