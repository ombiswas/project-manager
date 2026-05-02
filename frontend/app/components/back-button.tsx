import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
}

export const BackButton = ({ className }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(-1)}
      className={cn("flex items-center gap-1 px-3 py-1 mr-4", className)}
    >
      <ChevronLeft className="size-4" />
      <span>Back</span>
    </Button>
  );
};
