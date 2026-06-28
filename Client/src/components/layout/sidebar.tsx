<<<<<<< HEAD
// Application shell layout: sidebar navigation for the dashboard area.
// Renders the DSAS brand mark and role-based navigation items.
// Active-route detection is done via usePathname(): root "/" is an exact match,
// while other routes use startsWith so nested routes stay highlighted.
// Uses sidebar-specific CSS variables (--sidebar-*) defined in globals.css.

=======
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
<<<<<<< HEAD
import { LayoutDashboard, Users, FileText, BarChart3, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
=======
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  UserCog,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { type Role } from "@/context/auth-context";
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70

type NavItem = {
  href: string;
  label: string;
<<<<<<< HEAD
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
=======
  icon: React.ComponentType<{ className?: string }>;
};
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70

const navConfig: Record<Role, NavItem[]> = {
  admin: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/students", label: "Students", icon: Users },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/financial-reports", label: "Financial Reports", icon: BarChart3 },
    { href: "/users", label: "Users", icon: UserCog },
    { href: "/payroll", label: "Payroll", icon: DollarSign },
  ],
  clerk: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/students", label: "Students", icon: Users },
    { href: "/invoices", label: "Invoices", icon: FileText },
  ],
  instructor: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/students", label: "Students", icon: Users },
  ],
};

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
<<<<<<< HEAD
  const userRole = user?.role ? (user.role as string) : "staff";

  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));
=======
  const role = user?.role ?? "admin";
  const navItems = navConfig[role] ?? navConfig.admin;
>>>>>>> 7a82bb8f0a0c5946df665068d884d762f75ace70

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "flex h-full w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground shadow-sm transition-transform duration-200",
          "fixed inset-y-0 left-0 z-50 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-semibold tracking-wide text-sidebar-foreground"
          >
            DSAS
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
