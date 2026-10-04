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
    <div className="col-span-full flex flex-col items-center justify-center text-center py-12 px-6 bg-[#1a1c20] border border-[#212327] rounded-[8px] animate-in fade-in duration-200">
      <div className="p-3 bg-[#ff7a17]/10 rounded-full text-[#ff7a17] mb-3 border border-[#ff7a17]/30">
        <AlertCircle className="size-6 stroke-1.5" />
      </div>
      <h3 className="text-base font-normal text-white">{title}</h3>
      <p className="mt-1.5 text-sm font-normal text-[#7d8187] max-w-md mx-auto">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-5">
          <RotateCcw className="size-3.5 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  );
};
