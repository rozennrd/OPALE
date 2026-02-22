import { useState } from 'react'
import { Event } from '../../models/Event'
import { eventsApi } from '../../services/api/eventsApi'

export function useEventBatch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)

  const createEventsBatch = async (eventsData: Omit<Event, 'id'>[]): Promise<string[] | null> => {
    if (eventsData.length === 0) {
      setError('Aucun événement à créer')
      return null
    }

    try {
      setLoading(true)
      setError('')
      setProgress({ current: 0, total: eventsData.length })

      const response = await eventsApi.createEventsBatch(eventsData)

      if (response.success && response.data) {
        setProgress(null)
        return response.data.insertedIds
      } else {
        setError(response.error?.message || 'Erreur lors de la création des événements')
        setProgress(null)
        return null
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création des événements')
      setProgress(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createEventsBatch,
    loading,
    error,
    progress
  }
}
