import { useContext, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { AppContext } from "@/App";
import { fetchMyPoints, login } from "@/api/nereus/endpoints";
import {
  errorMessage,
  mapPoints,
  normalizeBranches,
  persistBranchChoice,
} from "@/api/nereus/normalize";
import logo from "@/assets/images/logo-blanco.png";
import mark from "@/assets/images/logozivo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/theme/ThemeProvider";

type LoginState = { isAuth?: boolean; user?: { username?: string } };

export default function LoginPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { state, dispatch } = useContext(AppContext) as {
    state: LoginState;
    dispatch: (_action: { type: string; payload?: unknown }) => void;
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  if (state?.isAuth && state.user?.username) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      const data = (await login(email.trim(), password)) as {
        access_token?: string;
        user?: { username?: string; email?: string; catchment_points?: unknown[] };
      };
      if (data?.user && !data.user.username) {
        data.user.username = data.user.email;
      }
      if (!data?.access_token || !data.user?.username) {
        throw new Error("La respuesta de login no incluye usuario o token");
      }

      const branches = normalizeBranches(data);
      const { branchId } = persistBranchChoice(branches);
      localStorage.setItem("token", JSON.stringify(data.access_token));
      localStorage.setItem("user", JSON.stringify(data.user));

      let points = mapPoints(data.user.catchment_points);
      try {
        const fresh = mapPoints(await fetchMyPoints());
        if (fresh.length) points = fresh;
      } catch (error) {
        if (!points.length) throw error;
      }

      dispatch({
        type: "LOGIN",
        payload: {
          access_token: data.access_token,
          user: { ...data.user, catchment_points: points },
          branches,
          branchId,
        },
      });
      toast.success("Sesión iniciada");
      navigate("/", { replace: true });
    } catch (error) {
      const message = errorMessage(error, "Usuario o contraseña incorrectos");
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-navy p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(204,207,7,0.35), transparent 42%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.12), transparent 40%)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <img src={logo} alt="" className="h-12 w-12 rounded-lg bg-white/10 object-contain p-1" />
          <div>
            <p className="text-2xl font-black leading-none">Ikolu</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-limebrand">
              Smart Hydro
            </p>
          </div>
        </div>
        <div className="relative max-w-md">
          <p className="text-sm font-bold uppercase tracking-wider text-limebrand">Telemetría</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">
            Captaciones, caudal y cumplimiento en un solo tablero.
          </h1>
          <p className="mt-4 text-base text-white/75">
            Los datos salen de la API de compatibilidad Nereus. El azul marino y el lima de Smart
            Hydro se mantienen en claro y en oscuro.
          </p>
        </div>
        <p className="relative text-xs font-bold uppercase tracking-wider text-white/50">
          api-ik-nereus
        </p>
      </section>

      <section className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <img src={mark} alt="" className="h-9 w-9 object-contain" />
            <span className="text-lg font-black text-navy dark:text-foreground">Ikolu</span>
          </div>
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <Card className="w-full max-w-md border-navy/10">
            <CardContent className="pt-6">
              <div className="mb-6 h-1.5 w-16 rounded-full bg-limebrand" />
              <h2 className="text-2xl font-black">Ingresa a tu cuenta</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Usa el correo de tu sucursal Smart Hydro.
              </p>
              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="usuario@smarthydro.cl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                {formError ? (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
                    {formError}
                  </p>
                ) : null}
                <Button type="submit" className="h-11 w-full" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : null}
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
