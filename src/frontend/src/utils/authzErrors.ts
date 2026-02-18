/**
 * Utility for parsing and mapping backend authorization errors to user-friendly messages.
 */

export interface AuthzErrorInfo {
  title: string;
  message: string;
  hint?: string;
  rawDetails: string;
  isAuthzError: boolean;
  isAdminAuthRequired: boolean;
}

/**
 * Detects if an error is authorization-related and returns friendly messaging.
 */
export function parseAuthzError(error: unknown): AuthzErrorInfo {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Extract raw details for debugging
  let rawDetails = errorMessage;
  if (error instanceof Error && error.stack) {
    rawDetails = `${error.name}: ${error.message}\n\nStack:\n${error.stack}`;
  } else if (typeof error === 'object' && error !== null) {
    try {
      rawDetails = JSON.stringify(error, null, 2);
    } catch {
      rawDetails = String(error);
    }
  }

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
        title: 'Admin Authorization Required',
        message: 'Your Internet Identity principal is not authorized as an admin yet.',
        hint: 'To authorize your principal as an admin, you must open the app with the caffeineAdminToken URL parameter. Add ?caffeineAdminToken=YOUR_TOKEN to the URL (or #caffeineAdminToken=YOUR_TOKEN for hash-based routing) and refresh the page. This will register your current Internet Identity principal as an admin in the backend.',
        rawDetails,
        isAuthzError: true,
        isAdminAuthRequired: true,
      };
    }

    // Check if it's a user-specific error
    if (lowerMessage.includes('only users can')) {
      return {
        title: 'User Access Required',
        message: 'You do not have permission to perform this action.',
        hint: 'Please ensure you are signed in with Internet Identity and have the necessary permissions.',
        rawDetails,
        isAuthzError: true,
        isAdminAuthRequired: false,
      };
    }

    // Generic authorization error
    return {
      title: 'Access Denied',
      message: errorMessage,
      hint: 'Please check your permissions and try again.',
      rawDetails,
      isAuthzError: true,
      isAdminAuthRequired: false,
    };
  }

  // Not an authorization error
  return {
    title: 'Error',
    message: errorMessage,
    rawDetails,
    isAuthzError: false,
    isAdminAuthRequired: false,
  };
}
