import { useContext, useState } from "react";
import { toast } from "sonner";
import { AppContext } from "@/App";
import portal from "@/api/nereus/portal";
import { errorText } from "@/api/nereus/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type User = {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
};

type Shell = {
  state: {
    user?: User;
    profile_client?: unknown[];
    selected_profile?: unknown;
  };
  dispatch: (_action: { type: string; payload?: unknown }) => void;
};

export default function ProfilePage() {
  const { state, dispatch } = useContext(AppContext) as Shell;
  const user = state.user || {};
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [email, setEmail] = useState(user.email || "");

  const save = async () => {
    if (!user.username) return;
    if (!firstName.trim()) {
      toast.error("Ingresa tu nombre");
      return;
    }
    setSaving(true);
    try {
      await portal.updateUser(user.username, {
        first_name: firstName,
        last_name: lastName,
        email,
      });
      dispatch({
        type: "UPDATE",
        payload: {
          user: {
            ...user,
            first_name: firstName,
            last_name: lastName,
            email,
            catchment_points: state.profile_client || [],
          },
          selected_profile: state.selected_profile,
        },
      });
      toast.success("Perfil actualizado");
      setEditing(false);
    } catch (error) {
      toast.error(errorText(error, "No se pudo actualizar el perfil."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Cuenta</p>
        <h2 className="mt-1 text-2xl font-black">{user.first_name || user.username || "Perfil"}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Información personal</CardTitle>
          {editing ? (
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="first">Nombre</Label>
            <Input id="first" className="mt-1" value={firstName} disabled={!editing} onChange={(event) => setFirstName(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="last">Apellido</Label>
            <Input id="last" className="mt-1" value={lastName} disabled={!editing} onChange={(event) => setLastName(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input id="email" className="mt-1" type="email" value={email} disabled={!editing} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="user">Usuario</Label>
            <Input id="user" className="mt-1" value={user.username || ""} disabled />
          </div>
          {editing ? (
            <div className="sm:col-span-2">
              <Button onClick={save} disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            El cambio de contraseña desde el perfil estará disponible próximamente. Contacta a soporte.
          </p>
          <Button className="mt-3" variant="outline" onClick={() => toast.info("Función no disponible")}>
            Cambiar contraseña
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
