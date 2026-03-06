import { NavLink, useLocation } from "react-router-dom";
import { Home, BookOpen, CalendarDays, CheckSquare, FolderKanban, List, Heart, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Today" },
  { to: "/log", icon: BookOpen, label: "Log" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/habits", icon: CheckSquare, label: "Habits" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/lists", icon: List, label: "Lists" },
  { to: "/health", icon: Heart, label: "Health" },
  { to: "/wins", icon: Trophy, label: "Wins" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg px-4 pt-4">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
