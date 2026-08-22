import { z } from 'zod'
import type {
  AdminScenario,
  AdminScenarioDraft,
  AdminTopic,
  AdminTopicDraft,
} from '@/entities/admin-content'

const requiredText = z.string().trim().min(1, 'Заполните поле.')

const jsonObjectText = z.string().superRefine((value, context) => {
  try {
    const parsed = JSON.parse(value) as unknown
    if (!isJsonObject(parsed)) throw new Error()
  } catch {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Введите корректный JSON-объект.',
    })
  }
})

export const adminTopicFormSchema = z.object({
  slug: requiredText.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Используйте латиницу и дефисы.'),
  role: z.enum(['buyer', 'seller']),
  title: requiredText,
  description: requiredText,
  sortOrder: z.number().int().min(1).max(6),
})

export const adminScenarioFormSchema = z.object({
  title: requiredText,
  description: requiredText,
  levelId: z.number().int().min(1).max(4),
  topicId: z.number().int().positive(),
  role: z.enum(['buyer', 'seller']),
  scamScheme: requiredText,
  productContext: jsonObjectText,
  aiSystemPrompt: requiredText,
  finalRubric: jsonObjectText,
})

export type AdminTopicFormValues = z.infer<typeof adminTopicFormSchema>
export type AdminScenarioFormValues = z.infer<typeof adminScenarioFormSchema>

export const emptyAdminTopicForm: AdminTopicFormValues = {
  slug: '',
  role: 'buyer',
  title: '',
  description: '',
  sortOrder: 1,
}

export const emptyAdminScenarioForm: AdminScenarioFormValues = {
  title: '',
  description: '',
  levelId: 1,
  topicId: 1,
  role: 'buyer',
  scamScheme: '',
  productContext: '{}',
  aiSystemPrompt: '',
  finalRubric: '{}',
}

export function mapTopicToForm(topic: AdminTopic): AdminTopicFormValues {
  const { slug, role, title, description, sortOrder } = topic
  return { slug, role, title, description, sortOrder }
}

export function mapTopicFormToDraft(values: AdminTopicFormValues): AdminTopicDraft {
  return values
}

export function mapScenarioToForm(scenario: AdminScenario): AdminScenarioFormValues {
  return {
    title: scenario.title,
    description: scenario.description,
    levelId: scenario.levelId,
    topicId: scenario.topicId,
    role: scenario.role,
    scamScheme: scenario.scamScheme,
    productContext: JSON.stringify(scenario.productContext, null, 2),
    aiSystemPrompt: scenario.aiSystemPrompt,
    finalRubric: JSON.stringify(scenario.finalRubric, null, 2),
  }
}

export function mapScenarioFormToDraft(values: AdminScenarioFormValues): AdminScenarioDraft {
  return {
    ...values,
    productContext: parseJsonObject(values.productContext),
    finalRubric: parseJsonObject(values.finalRubric),
  }
}

function parseJsonObject(value: string): Record<string, unknown> {
  const parsed = JSON.parse(value) as unknown
  if (!isJsonObject(parsed)) throw new Error('Ожидался JSON-объект.')
  return parsed
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
