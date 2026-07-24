"use client"

import { useCallback, useState } from "react"

interface UseAsyncActionOptions {
  /** Called with the error message when the action throws */
  onError?: (message: string) => void
  /** Called after the action resolves successfully */
  onSuccess?: () => void
}

interface UseAsyncActionResult<TArgs extends unknown[]> {
  /** Runs the wrapped action, tracking loading and error state */
  run: (...args: TArgs) => Promise<void>
  loading: boolean
  error: string | null
  /** Clears the current error */
  reset: () => void
}

/**
 * Encapsulates the loading/error/try-catch boilerplate repeated across every
 * fetch-based form. Pair with a toast via `onError`/`onSuccess`.
 */
export function useAsyncAction<TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<void>,
  options?: UseAsyncActionOptions,
): UseAsyncActionResult<TArgs> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (...args: TArgs) => {
      setLoading(true)
      setError(null)
      try {
        await action(...args)
        options?.onSuccess?.()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Algo deu errado"
        setError(message)
        options?.onError?.(message)
      } finally {
        setLoading(false)
      }
    },
    [action, options],
  )

  const reset = useCallback(() => setError(null), [])

  return { run, loading, error, reset }
}
