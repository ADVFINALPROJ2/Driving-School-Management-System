import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Unauthorized
        </h1>
        <p className="max-w-sm text-muted-foreground">
          You do not have permission to access this page. This area is restricted
          to administrators only.
        </p>
        <Button asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
