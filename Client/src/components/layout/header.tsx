"use client";

import { useTheme } from "next-themes";
<<<<<<< HEAD
import { Sun, Moon, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
=======
import { Sun, Moon, Menu, LogOut } from "lucide-react";
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

<<<<<<< HEAD
interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
=======
const roleLabels: Record<string, string> = {
  admin: "Admin",
  clerk: "Clerk",
  instructor: "Instructor",
};

const roleBadgeVariant: Record<string, "default" | "secondary" | "success"> = {
  admin: "default",
  clerk: "secondary",
  instructor: "success",
};

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
<<<<<<< HEAD
    <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <span className="font-semibold text-foreground">DSAS</span>
=======
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
          aria-label="Open menu"
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">
          Driving School Admin
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {user && (
          <>
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {user.full_name}
            </span>
            <Badge variant={roleBadgeVariant[user.role] ?? "secondary"}>
              {roleLabels[user.role] ?? user.role}
            </Badge>
          </>
        )}

        <button
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle theme"
          type="button"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:block">{user?.full_name}</span>

        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle theme"
          type="button"
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          aria-label="User avatar"
        >
          {initials}
        </div>

        <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
