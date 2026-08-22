import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useChangeAdminTopicStatusMutation,
  useCreateAdminTopicMutation,
  useGetAdminTopicQuery,
  useUpdateAdminTopicMutation,
} from '@/entities/admin-content'
import { getApiErrorMessage } from '@/shared/http-error'
import {
  adminTopicFormSchema,
  emptyAdminTopicForm,
  mapTopicFormToDraft,
  mapTopicToForm,
  type AdminTopicFormValues,
} from '../model/adminForms'
import { ContentStatusActions } from './ContentStatusActions'
import { EditorActions, PrimaryAction, SelectField, TextAreaField, TextField } from './AdminFields'
import { QuizEditor } from './QuizEditor'
import { TheoryEditor } from './TheoryEditor'
import styles from './AdminPage.module.scss'

interface AdminTopicEditorProps {
  topicId?: number
  onCreated: (id: number) => void
}

export function AdminTopicEditor({ topicId, onCreated }: AdminTopicEditorProps) {
  const { data: topic, isLoading, error } = useGetAdminTopicQuery(topicId ?? 0, { skip: !topicId })
  const [message, setMessage] = useState<string>()
  const [createTopic, createState] = useCreateAdminTopicMutation()
  const [updateTopic, updateState] = useUpdateAdminTopicMutation()
  const [changeStatus, statusState] = useChangeAdminTopicStatusMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminTopicFormValues>({
    resolver: zodResolver(adminTopicFormSchema),
    defaultValues: emptyAdminTopicForm,
  })

  useEffect(() => {
    reset(topic ? mapTopicToForm(topic) : emptyAdminTopicForm)
  }, [reset, topic])

  const save = async (formValues: AdminTopicFormValues) => {
    setMessage(undefined)
    try {
      const value = mapTopicFormToDraft(formValues)
      if (topicId) {
        await updateTopic({ topicId, value }).unwrap()
        setMessage('Основные данные Темы сохранены.')
      } else {
        const created = await createTopic(value).unwrap()
        if (!created.id) throw new Error('Backend не вернул id Темы.')
        onCreated(created.id)
      }
    } catch (requestError) {
      setMessage(getApiErrorMessage(requestError))
    }
  }

  const applyStatus = async (action: 'publish' | 'deactivate' | 'restore' | 'archive') => {
    if (!topicId) return
    setMessage(undefined)
    try {
      await changeStatus({ topicId, action }).unwrap()
      setMessage('Статус Темы обновлён.')
    } catch (requestError) {
      setMessage(getApiErrorMessage(requestError))
    }
  }

  if (isLoading) return <div className={styles.editor}>Загружаем Тему…</div>
  if (error) return <div className={styles.editorError}>{getApiErrorMessage(error)}</div>

  const pending = createState.isLoading || updateState.isLoading || statusState.isLoading
  const editable = !topic?.status || topic.status === 'draft'

  return (
    <article className={styles.editor}>
      <div className={styles.editorTitle}>
        <div>
          <span className={styles.eyebrow}>{topicId ? `Тема #${topicId}` : 'Новый материал'}</span>
          <h2>{topicId ? topic?.title : 'Создать Тему'}</h2>
        </div>
        {topic?.status && <span data-status={topic.status}>{topic.status}</span>}
      </div>

      <div className={styles.formGrid}>
        <TextField
          disabled={!editable}
          error={errors.title?.message}
          label="Название"
          {...register('title')}
        />
        <TextField
          disabled={!editable}
          error={errors.slug?.message}
          label="Slug"
          hint="Латиницей, например phishing-links"
          {...register('slug')}
        />
        <SelectField
          disabled={!editable}
          error={errors.role?.message}
          label="Ролевая ветка"
          {...register('role')}
        >
          <option value="buyer">Покупатель</option>
          <option value="seller">Продавец</option>
        </SelectField>
        <TextField
          disabled={!editable}
          error={errors.sortOrder?.message}
          label="Порядок"
          max={6}
          min={1}
          type="number"
          {...register('sortOrder', { valueAsNumber: true })}
        />
        <TextAreaField
          className={styles.wideField}
          disabled={!editable}
          error={errors.description?.message}
          label="Описание"
          {...register('description')}
        />
      </div>

      {message && <p className={styles.formMessage}>{message}</p>}
      {editable && (
        <EditorActions>
          <PrimaryAction disabled={pending} onClick={handleSubmit(save)}>
            {topicId ? 'Сохранить Тему' : 'Создать черновик'}
          </PrimaryAction>
        </EditorActions>
      )}
      <ContentStatusActions disabled={pending} status={topic?.status} onAction={applyStatus} />

      {topicId && topic && (
        <>
          <TheoryEditor editable={editable} topic={topic} />
          <QuizEditor editable={editable} topic={topic} />
        </>
      )}
    </article>
  )
}
