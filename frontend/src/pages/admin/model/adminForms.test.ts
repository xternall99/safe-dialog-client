import { describe, expect, it } from 'vitest'
import { adminScenarioFormSchema, adminTopicFormSchema, mapScenarioFormToDraft } from './adminForms'

describe('admin form boundary', () => {
  it('rejects invalid Topic slugs before an API request', () => {
    const result = adminTopicFormSchema.safeParse({
      slug: 'Не slug',
      role: 'buyer',
      title: 'Тема',
      description: 'Описание',
      sortOrder: 1,
    })

    expect(result.success).toBe(false)
  })

  it('accepts JSON objects and maps them to a Scenario draft', () => {
    const values = adminScenarioFormSchema.parse({
      title: 'Сценарий',
      description: 'Описание',
      levelId: 2,
      topicId: 4,
      role: 'seller',
      scamScheme: 'external-link',
      productContext: '{"product":"Велосипед"}',
      aiSystemPrompt: 'Следуй правилам',
      finalRubric: '{"safe":true}',
    })

    expect(mapScenarioFormToDraft(values)).toMatchObject({
      productContext: { product: 'Велосипед' },
      finalRubric: { safe: true },
    })
  })

  it('rejects arrays where the backend contract expects a JSON object', () => {
    const result = adminScenarioFormSchema.safeParse({
      title: 'Сценарий',
      description: 'Описание',
      levelId: 2,
      topicId: 4,
      role: 'seller',
      scamScheme: 'external-link',
      productContext: '[]',
      aiSystemPrompt: 'Следуй правилам',
      finalRubric: '{}',
    })

    expect(result.success).toBe(false)
  })
})
