import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-canvas pt-10 pb-20 px-4 text-center">
      <h1 className="text-6xl font-mono text-ink tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-normal tracking-tight text-ink mb-2">
        Page Not Found
      </h2>
      <p className="text-sm text-mute mb-8 max-w-sm leading-relaxed font-light">
        The resource you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="rounded-full font-mono text-xs px-6 h-9">
        <Link to="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
