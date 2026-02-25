"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scissors,
  CalendarDays,
  Users,
  Clock,
  CalendarX,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/turnos", label: "Turnos", icon: CalendarDays },
  { href: "/admin/clientes", label: "Clientes conocidos", icon: Users },
  { href: "/admin/servicios", label: "Servicios", icon: Scissors },
  { href: "/admin/horarios", label: "Horarios", icon: Clock },
  { href: "/admin/dias-bloqueados", label: "Días bloqueados", icon: CalendarX },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-zinc-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-sm tracking-wide">COBRÁN</span>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">Panel admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-amber-400 text-zinc-900 font-semibold"
                  : "text-zinc-300 hover:bg-zinc-800"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-zinc-700">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
