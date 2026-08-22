import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useChangeAdminScenarioStatusMutation,
  useCreateAdminScenarioMutation,
  useGetAdminTopicsQuery,
  useUpdateAdminScenarioMutation,
  type AdminScenario,
} from '@/entities/admin-content'
import type { UserRole } from '@/entities/user'
import { getApiErrorMessage } from '@/shared/http-error'
import {
  adminScenarioFormSchema,
  emptyAdminScenarioForm,
  mapScenarioFormToDraft,
  mapScenarioToForm,
  type AdminScenarioFormValues,
} from '../model/adminForms'
import { ContentStatusActions } from './ContentStatusActions'
import { EditorActions, PrimaryAction, SelectField, TextAreaField, TextField } from './AdminFields'
import styles from './AdminPage.module.scss'

interface AdminScenarioEditorProps {
  scenario?: AdminScenario
  onCreated: (id: number) => void
}

export function AdminScenarioEditor({ scenario, onCreated }: AdminScenarioEditorProps) {
  const scenarioId = scenario?.id
  const { data: topics = [] } = useGetAdminTopicsQuery()
  const [message, setMessage] = useState<string>()
  const [createScenario, createState] = useCreateAdminScenarioMutation()
  const [updateScenario, updateState] = useUpdateAdminScenarioMutation()
  const [changeStatus, statusState] = useChangeAdminScenarioStatusMutation()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdminScenarioFormValues>({
    resolver: zodResolver(adminScenarioFormSchema),
    defaultValues: emptyAdminScenarioForm,
  })
  const selectedRole = watch('role')
  const selectedTopicId = watch('topicId')

  useEffect(() => {
    reset(scenario ? mapScenarioToForm(scenario) : emptyAdminScenarioForm)
  }, [reset, scenario])

  useEffect(() => {
    if (scenarioId) return

    const selectedTopic = topics.find((topic) => topic.id === selectedTopicId)
    if (selectedTopic?.role === selectedRole && selectedTopic.status !== 'archived') return

    const firstTopic = topics.find(
      (topic) => topic.role === selectedRole && topic.status !== 'archived',
    )
    if (firstTopic?.id) setValue('topicId', firstTopic.id, { shouldValidate: true })
  }, [scenarioId, selectedRole, selectedTopicId, setValue, topics])

  const save = async (formValues: AdminScenarioFormValues) => {
    setMessage(undefined)
    try {
      const value = mapScenarioFormToDraft(formValues)
      if (scenarioId) {
        await updateScenario({ scenarioId, value }).unwrap()
        setMessage('Основные данные Сценария сохранены.')
      } else {
        const created = await createScenario(value).unwrap()
        if (!created.id) throw new Error('Backend не вернул id Сценария.')
        onCreated(created.id)
      }
    } catch (requestError) {
      setMessage(getApiErrorMessage(requestError))
    }
  }

  const applyStatus = async (action: 'publish' | 'deactivate' | 'restore' | 'archive') => {
    if (!scenarioId) return
    setMessage(undefined)
    try {
      await changeStatus({ scenarioId, action }).unwrap()
      setMessage('Статус Сценария обновлён.')
    } catch (requestError) {
      setMessage(getApiErrorMessage(requestError))
    }
  }

  const pending = createState.isLoading || updateState.isLoading || statusState.isLoading
  const editable = !scenario?.status || scenario.status === 'draft'
  const matchingTopics = topics.filter(
    (topic) => topic.role === selectedRole && topic.status !== 'archived',
  )

  return (
    <article className={styles.editor}>
      <div className={styles.editorTitle}>
        <div>
          <span className={styles.eyebrow}>
            {scenarioId ? `Сценарий #${scenarioId}` : 'Новая тренировка'}
          </span>
          <h2>{scenarioId ? scenario?.title : 'Создать Сценарий'}</h2>
        </div>
        {scenario?.status && <span data-status={scenario.status}>{scenario.status}</span>}
      </div>

      <div className={styles.formGrid}>
        <TextField
          className={styles.wideField}
          disabled={!editable}
          error={errors.title?.message}
          label="Название"
          {...register('title')}
        />
        <SelectField
          disabled={!editable}
          error={errors.role?.message}
          label="Ролевая ветка"
          value={selectedRole}
          onChange={(event) => {
            const role = event.target.value as UserRole
            const firstTopic = topics.find(
              (topic) => topic.role === role && topic.status !== 'archived',
            )
            setValue('role', role, { shouldDirty: true, shouldValidate: true })
            if (firstTopic?.id) {
              setValue('topicId', firstTopic.id, { shouldDirty: true, shouldValidate: true })
            }
          }}
        >
          <option value="buyer">Покупатель</option>
          <option value="seller">Продавец</option>
        </SelectField>
        <SelectField
          disabled={!editable}
          error={errors.topicId?.message}
          label="Тема"
          value={selectedTopicId}
          onChange={(event) =>
            setValue('topicId', Number(event.target.value), {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          {matchingTopics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </SelectField>
        <SelectField
          disabled={!editable}
          error={errors.levelId?.message}
          label="Уровень"
          hint="Уровни 1–4 используют соответствующие backend id"
          {...register('levelId', { valueAsNumber: true })}
        >
          {[1, 2, 3, 4].map((level) => (
            <option key={level} value={level}>
              Уровень {level}
            </option>
          ))}
        </SelectField>
        <TextAreaField
          className={styles.wideField}
          disabled={!editable}
          error={errors.description?.message}
          label="Описание"
          {...register('description')}
        />
        <TextField
          className={styles.wideField}
          disabled={!editable}
          error={errors.scamScheme?.message}
          label="Схема мошенничества"
          {...register('scamScheme')}
        />
        <TextAreaField
          className={styles.wideField}
          disabled={!editable}
          error={errors.productContext?.message}
          label="Контекст товара (JSON)"
          {...register('productContext')}
        />
        <TextAreaField
          className={styles.wideField}
          disabled={!editable}
          error={errors.aiSystemPrompt?.message}
          label="Системная инструкция AI"
          {...register('aiSystemPrompt')}
        />
        <TextAreaField
          className={styles.wideField}
          disabled={!editable}
          error={errors.finalRubric?.message}
          label="Итоговая рубрика (JSON)"
          {...register('finalRubric')}
        />
      </div>

      {message && <p className={styles.formMessage}>{message}</p>}
      {editable && (
        <EditorActions>
          <PrimaryAction disabled={pending} onClick={handleSubmit(save)}>
            {scenarioId ? 'Сохранить Сценарий' : 'Создать черновик'}
          </PrimaryAction>
        </EditorActions>
      )}
      <ContentStatusActions disabled={pending} status={scenario?.status} onAction={applyStatus} />

      {scenarioId && (
        <aside className={styles.contractNotice}>
          <b>Редактор Шагов ограничен текущим API</b>
          <p>
            Backend принимает команды создания и изменения Шагов, но не возвращает их состав
            админскому клиенту. Поэтому интерфейс не показывает неподтверждённые данные и не хранит
            их только в памяти браузера.
          </p>
        </aside>
      )}
    </article>
  )
}
