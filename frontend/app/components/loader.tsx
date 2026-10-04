import { Loader2 } from "lucide-react"

interface LoaderProps {
    label?: string;
}

export const Loader = ({ label = "Loading..." }: LoaderProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-3 animate-in fade-in duration-200">
            <div className="relative flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white stroke-[1.5]" />
            </div>
            {label && (
                <p className="text-xs font-mono uppercase tracking-[1.2px] text-[#7d8187]">
                    {label}
                </p>
            )}
        </div>
    );
};