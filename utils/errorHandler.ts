export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleSupabaseError(error: any): AppError {
  if (!error) {
    return new AppError('Unknown error occurred')
  }

  const message = error.message || 'An error occurred'
  const code = error.code

  switch (code) {
    case 'PGRST116':
      return new AppError('Resource not found', 'NOT_FOUND')
    case '23505':
      return new AppError('This resource already exists', 'DUPLICATE')
    case '23503':
      return new AppError('Referenced resource does not exist', 'FOREIGN_KEY')
    case 'PGRST301':
      return new AppError('You are not authorized to perform this action', 'UNAUTHORIZED')
    case 'PGRST302':
      return new AppError('Resource not found', 'NOT_FOUND')
    default:
      return new AppError(message, code, error)
  }
}

export function showErrorToast(error: AppError | Error) {
  console.error('Error:', error.message)
  
  if (typeof window !== 'undefined' && 'alert' in window) {
    alert(error.message)
  }
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T | null> {
  try {
    return await operation()
  } catch (error: any) {
    const appError = handleSupabaseError(error)
    showErrorToast(new AppError(errorMessage, appError.code, appError.details))
    return null
  }
}
