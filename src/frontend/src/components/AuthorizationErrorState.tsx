import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { parseAuthzError } from '@/utils/authzErrors';
import { useState } from 'react';

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
  const [copied, setCopied] = useState(false);

  const handleCopyError = async () => {
    try {
      await navigator.clipboard.writeText(errorInfo.rawDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

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
        <div className="rounded-lg bg-muted/50 p-4 border border-border">
          <p className="text-sm text-foreground font-medium mb-2">
            💡 How to fix this:
          </p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {errorInfo.hint}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Error Details
          </p>
          <Button
            onClick={handleCopyError}
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
          >
            {copied ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3 w-3" />
                Copy
              </>
            )}
          </Button>
        </div>
        <pre className="text-xs bg-black/30 p-3 rounded-md overflow-x-auto border border-border font-mono">
          {errorInfo.rawDetails}
        </pre>
      </div>

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
