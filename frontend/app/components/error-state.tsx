import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState = ({
  title = "Something went wrong",
  message = "Failed to load data. Please check your connection and try again.",
  onRetry,
  retryText = "Try Again",
}: ErrorStateProps) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-12 px-4 bg-destructive/5 border border-destructive/20 rounded-lg animate-in fade-in duration-300">
      <div className="p-3 bg-destructive/10 rounded-full text-destructive mb-3">
        <AlertCircle className="size-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4 border-destructive/30 hover:bg-destructive/10">
          <RotateCcw className="size-4 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  );
};
