// @vitest-environment node

import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { createTestStore } from '@/test/createTestStore'
import { server } from '@/test/server'
import { adminScenarioApi } from './adminScenarioApi'

const scenarioResponse = {
  id: 9,
  title: 'Поддельная доставка',
  description: 'Тренировка безопасной доставки',
  level_id: 2,
  topic_id: 4,
  role: 'seller',
  status: 'draft',
  scam_scheme: 'external_delivery',
  product_context: { product: 'Велосипед' },
  ai_system_prompt: 'Следуй Сценарию',
  final_rubric: { safe: true },
  steps: [],
}

describe('admin Scenario API boundary', () => {
  it('maps Scenario DTO fields to the frontend model', async () => {
    server.use(
      http.get('http://localhost/api/v1/admin/scenarios', () =>
        HttpResponse.json([scenarioResponse]),
      ),
    )

    const store = createTestStore()
    const scenarios = await store
      .dispatch(adminScenarioApi.endpoints.getAdminScenarios.initiate())
      .unwrap()

    expect(scenarios[0]).toMatchObject({
      id: 9,
      levelId: 2,
      topicId: 4,
      productContext: { product: 'Велосипед' },
    })
  })

  it('posts only the writable Scenario contract', async () => {
    server.use(
      http.post('http://localhost/api/v1/admin/scenarios', async ({ request }) => {
        expect(await request.json()).toEqual({
          title: 'Поддельная доставка',
          description: 'Тренировка безопасной доставки',
          level_id: 2,
          topic_id: 4,
          role: 'seller',
          scam_scheme: 'external_delivery',
          product_context: { product: 'Велосипед' },
          ai_system_prompt: 'Следуй Сценарию',
          final_rubric: { safe: true },
        })
        return HttpResponse.json(scenarioResponse, { status: 201 })
      }),
    )

    const store = createTestStore()
    const scenario = await store
      .dispatch(
        adminScenarioApi.endpoints.createAdminScenario.initiate({
          title: 'Поддельная доставка',
          description: 'Тренировка безопасной доставки',
          levelId: 2,
          topicId: 4,
          role: 'seller',
          scamScheme: 'external_delivery',
          productContext: { product: 'Велосипед' },
          aiSystemPrompt: 'Следуй Сценарию',
          finalRubric: { safe: true },
        }),
      )
      .unwrap()

    expect(scenario.id).toBe(9)
  })
})
