/**
 * Error handling utilities for mutation callbacks
 */

/**
 * Determines if an error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('cors')
  );
}

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
    return (error as { message: string }).message;
  }
  
  return String(error);
}

/**
 * Creates a standardized error message for network failures
 */
export function getNetworkErrorMessage(actionDescription: string): string {
  return `Network error: Failed to ${actionDescription}. Please check your connection and try again.`;
}

/**
 * Creates a standardized error message for server failures
 */
export function getServerErrorMessage(actionDescription: string, error: unknown): string {
  const errorMsg = getErrorMessage(error);
  return `Failed to ${actionDescription}: ${errorMsg}`;
}
