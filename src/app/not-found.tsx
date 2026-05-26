import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-8 text-center">
      <div className="text-8xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
        404
      </div>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/">
        <Button variant="primary" size="lg" className="gap-2">
          <Home className="h-4 w-4" /> Go Home
        </Button>
      </Link>
    </div>
  );
}
