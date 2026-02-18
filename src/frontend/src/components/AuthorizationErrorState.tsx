import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { parseAuthzError } from '@/utils/authzErrors';

interface AuthorizationErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  variant?: 'inline' | 'card';
}

/**
 * Reusable component for displaying authorization and other errors with retry functionality.
 */
export default function AuthorizationErrorState({
  error,
  onRetry,
  variant = 'inline',
}: AuthorizationErrorStateProps) {
  const errorInfo = parseAuthzError(error);

  const content = (
    <div className="space-y-4">
      <Alert variant={errorInfo.isAuthzError ? 'destructive' : 'default'}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{errorInfo.title}</AlertTitle>
        <AlertDescription className="mt-2">
          {errorInfo.message}
        </AlertDescription>
      </Alert>

      {errorInfo.hint && (
        <p className="text-sm text-muted-foreground">
          {errorInfo.hint}
        </p>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className="glass-panel border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400">Error</CardTitle>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}
