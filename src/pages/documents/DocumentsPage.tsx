import { useContext, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { AppContext } from "@/App";
import { errorText, isUnavailable, retryUnlessMissing, UNAVAILABLE_MESSAGE } from "@/api/nereus/errors";
import portal from "@/api/nereus/portal";
import { DataTable } from "@/components/brand/DataTable";
import { EmptyState, ErrorState } from "@/components/brand/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { records, text } from "@/lib/records";
import { showDocuments } from "@/utils/userFlags";

type Shell = { state: { selected_profile?: { id?: string | number; name?: string; title?: string } | null } };

const TYPES = [
  { value: "1", label: "Plano" },
  { value: "2", label: "Memoria" },
  { value: "3", label: "Certificado" },
  { value: "4", label: "Otro" },
];

export default function DocumentsPage() {
  const enabled = showDocuments();
  const { state } = useContext(AppContext) as Shell;
  const queryClient = useQueryClient();
  const pointId = state.selected_profile?.id || "";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [typeFile, setTypeFile] = useState("4");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const query = useQuery({
    queryKey: ["documents", pointId],
    enabled: enabled && Boolean(pointId),
    retry: retryUnlessMissing,
    queryFn: () => portal.getFiles(pointId),
  });

  if (!enabled) {
    return (
      <EmptyState
        title={UNAVAILABLE_MESSAGE}
        description="Los documentos de la captación están desactivados en este portal."
        icon={FolderOpen}
      />
    );
  }

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pointId || !file || !name.trim()) {
      toast.error("Nombre y archivo son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await portal.uploadFile({
        file: { originFileObj: file },
        point_catchment: pointId,
        name,
        description,
        type_file: typeFile,
      });
      toast.success("Documento cargado");
      setName("");
      setDescription("");
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["documents", pointId] });
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string | number) => {
    if (!window.confirm("¿Eliminar este documento?")) return;
    try {
      await portal.deleteFile(id);
      toast.success("Documento eliminado");
      queryClient.invalidateQueries({ queryKey: ["documents", pointId] });
    } catch (error) {
      toast.error(errorText(error));
    }
  };

  const rows = records(query.data, ["results", "items", "files"]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-navy dark:text-limebrand">Archivos</p>
        <h2 className="mt-1 text-2xl font-black">Documentos</h2>
      </div>
      {query.isError ? (
        <ErrorState
          title={isUnavailable(query.error) ? UNAVAILABLE_MESSAGE : "No pudimos listar los documentos"}
          description={errorText(query.error)}
          onRetry={() => query.refetch()}
        />
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Subir</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={upload}>
            <div>
              <Label htmlFor="doc-name">Nombre</Label>
              <Input id="doc-name" className="mt-1" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={typeFile} onValueChange={setTypeFile}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="doc-desc">Descripción</Label>
              <Input id="doc-desc" className="mt-1" value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="doc-file">Archivo</Label>
              <Input id="doc-file" className="mt-1" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </div>
            <Button type="submit" disabled={saving || !pointId}>{saving ? "Subiendo…" : "Cargar"}</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5">
          <DataTable
            rows={rows}
            empty={query.isLoading ? "Cargando…" : "No hay documentos."}
            columns={[
              { key: "name", label: "Nombre", render: (row) => text(row, ["name", "title"]) },
              { key: "type", label: "Tipo", render: (row) => TYPES.find((item) => item.value === String(row.type_file))?.label || text(row, ["type_file"]) },
              {
                key: "file",
                label: "Archivo",
                render: (row) => {
                  const href = text(row, ["file", "url"], "");
                  return href && href !== "—" ? <a className="underline" href={href} target="_blank" rel="noreferrer">Abrir</a> : "—";
                },
              },
              {
                key: "actions",
                label: "",
                render: (row) => (
                  <Button size="sm" variant="destructive" onClick={() => remove(row.id as string | number)}>Eliminar</Button>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
