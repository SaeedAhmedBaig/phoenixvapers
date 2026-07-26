import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-pine text-xs font-semibold tracking-widest uppercase">404</p>
      <h1 className="font-display mt-3 text-3xl font-medium">Page not found</h1>
      <p className="text-muted-foreground mt-2 text-sm">That page does not exist or may have moved.</p>
      <Button asChild className="mt-6"><Link href="/">Back to home</Link></Button>
    </div>
  );
}
