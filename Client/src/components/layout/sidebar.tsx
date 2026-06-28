// Application shell layout: sidebar navigation for the dashboard area.
// Renders the DSAS brand mark and role-based navigation items.
// Active-route detection is done via usePathname(): root "/" is an exact match,
// while other routes use startsWith so nested routes stay highlighted.
// Uses sidebar-specific CSS variables (--sidebar-*) defined in globals.css.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, BarChart3, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

type NavItem = {
  href: string;
  label: string;
  icon: any;
  roles: string[];
};

const allNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "receptionist", "instructor", "staff"] },
  { href: "/students", label: "Students", icon: Users, roles: ["admin", "receptionist", "instructor", "staff"] },
  { href: "/invoices", label: "Invoices", icon: FileText, roles: ["admin", "receptionist"] },
  { href: "/financial-reports", label: "Financial Reports", icon: BarChart3, roles: ["admin"] },
  { href: "/payroll", label: "Payroll", icon: DollarSign, roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role ? (user.role as string) : "staff";

  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground shadow-sm">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="text-xl font-semibold tracking-wide text-sidebar-foreground">
          DSAS
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
