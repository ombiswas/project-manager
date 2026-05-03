import { Loader2 } from "lucide-react"

interface LoaderProps {
    label?: string;
}

export const Loader = ({ label = "Loading..." }: LoaderProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-4 animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 blur-xl animate-pulse" />
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 relative z-10" />
            </div>
            {label && (
                <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
                    {label}
                </p>
            )}
        </div>
    );
};