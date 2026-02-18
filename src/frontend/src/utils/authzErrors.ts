/**
 * Utility for parsing and mapping backend authorization errors to user-friendly messages.
 */

export interface AuthzErrorInfo {
  title: string;
  message: string;
  hint?: string;
  isAuthzError: boolean;
}

/**
 * Detects if an error is authorization-related and returns friendly messaging.
 */
export function parseAuthzError(error: unknown): AuthzErrorInfo {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Check for common authorization error patterns
  const isUnauthorized = 
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('only users can') ||
    lowerMessage.includes('only admins can') ||
    lowerMessage.includes('permission') ||
    lowerMessage.includes('access denied');

  if (isUnauthorized) {
    // Check if it's an admin-specific error
    if (lowerMessage.includes('only admins can')) {
      return {
        title: 'Admin Access Required',
        message: 'This action requires administrator privileges.',
        hint: 'If you are an admin, ensure you opened the app with the caffeineAdminToken URL parameter.',
        isAuthzError: true,
      };
    }

    // Check if it's a user-specific error
    if (lowerMessage.includes('only users can')) {
      return {
        title: 'User Access Required',
        message: 'You do not have permission to perform this action.',
        hint: 'Please ensure you are signed in with Internet Identity and have the necessary permissions.',
        isAuthzError: true,
      };
    }

    // Generic authorization error
    return {
      title: 'Access Denied',
      message: errorMessage,
      hint: 'Please check your permissions and try again.',
      isAuthzError: true,
    };
  }

  // Not an authorization error
  return {
    title: 'Error',
    message: errorMessage,
    isAuthzError: false,
  };
}
