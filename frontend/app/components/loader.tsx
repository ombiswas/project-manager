import { Loader2 } from "lucide-react"

interface LoaderProps {
    label?: string;
}

export const Loader = ({ label }: LoaderProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600"/>
            {label && (
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    {label}
                </p>
            )}
        </div>
    );
};