import type { ContentStatus } from './types'

export const contentStatusLabels: Record<ContentStatus, string> = {
  draft: 'Черновик',
  published: 'Опубликовано',
  archived: 'В архиве',
}
