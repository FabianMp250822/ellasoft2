import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    fullScreen?: boolean;
}

export function LoadingSpinner({ fullScreen = false }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen && "h-screen w-screen"
      )}
    >
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
