import { useContext, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { AppContext } from "@/App";
import { fetchMyPoints } from "@/api/nereus/endpoints";
import { displayName, errorMessage, mapPoints } from "@/api/nereus/normalize";
import { queryClient } from "@/api/nereus/queryClient";
import logo from "@/assets/images/logo-blanco.png";
import { useTheme } from "@/theme/ThemeProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { isNavActive, titleForPath, visibleNav } from "./navigation";

type Branch = { id: string; name: string };

type ShellState = {
  user?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    is_staff?: boolean;
  } | null;
  branches?: Branch[];
  branchId?: string | null;
  selected_profile?: { dga?: { code_dga?: string } } | null;
};

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean).slice(0, 2);
  if (!parts.length) return "IK";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { state } = useContext(AppContext) as { state: ShellState };
  const items = visibleNav(state.user, state.selected_profile);

  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isNavActive(location.pathname, item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={
              active
                ? "flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2.5 text-sm font-bold text-sidebar-accent-foreground"
                : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-sidebar-foreground/85 hover:bg-white/10"
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <img src={logo} alt="Smart Hydro" className="h-9 w-9 rounded-md bg-white/10 object-contain p-1" />
      <div className="min-w-0">
        <p className="truncate text-base font-black leading-none text-white">Ikolu</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-limebrand">
          Smart Hydro
        </p>
      </div>
    </div>
  );
}

function BranchSelect() {
  const { state, dispatch } = useContext(AppContext) as {
    state: ShellState;
    dispatch: (_action: { type: string; payload?: unknown }) => void;
  };
  const branches = state.branches || [];
  if (branches.length < 2) return null;

  const onChange = async (branchId: string) => {
    localStorage.setItem("branch_multi", "1");
    localStorage.setItem("branch_id", branchId);
    dispatch({ type: "SET_BRANCH", payload: { branchId } });
    await queryClient.invalidateQueries();
    try {
      const points = mapPoints(await fetchMyPoints());
      dispatch({
        type: "SET_PROFILE_CLIENT",
        payload: {
          profile_client: points,
          selected_profile: points[0] || null,
        },
      });
    } catch (error) {
      toast.error(errorMessage(error, "No se pudieron cargar los puntos de la sucursal"));
    }
  };

  return (
    <div className="min-w-0 flex-1 md:w-56 md:flex-none">
      <Select value={state.branchId || undefined} onValueChange={onChange}>
        <SelectTrigger aria-label="Sucursal">
          <SelectValue placeholder="Sucursal" />
        </SelectTrigger>
        <SelectContent>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function UserMenu() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { state, dispatch } = useContext(AppContext) as {
    state: ShellState;
    dispatch: (_action: { type: string }) => void;
  };
  const name = displayName(state.user);
  const email = state.user?.email || state.user?.username || "";

  const logout = () => {
    queryClient.clear();
    dispatch({ type: "LOGOUT" });
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 text-left hover:bg-muted"
          aria-label="Menú de usuario"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[9rem] truncate text-sm font-bold sm:block">{name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block">{name}</span>
          {email ? <span className="block text-xs font-medium text-muted-foreground">{email}</span> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={toggleTheme}>
          {theme === "dark" ? <Sun /> : <Moon />}
          {theme === "dark" ? "Modo claro" : "Modo oscuro"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/profile")}>Perfil</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout}>
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const title = titleForPath(location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <Brand />
        <div className="mx-4 h-px bg-white/15" />
        <ScrollArea className="flex-1 py-3">
          <SideNav />
        </ScrollArea>
        <p className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-white/50">
          Nereus
        </p>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle className="text-white">Ikolu</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <SideNav onNavigate={() => setOpen(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-col md:pl-64">
        <header className="sticky top-0 z-30 flex flex-col gap-3 border-b bg-card/95 px-3 py-3 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu />
            </Button>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Ikolu
              </p>
              <h1 className="truncate text-lg font-black leading-tight">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BranchSelect />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 px-3 py-4 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
