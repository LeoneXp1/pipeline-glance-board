import { useState } from "react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { leadsDb } from "@/lib/external-supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ETAPAS = ["Novo", "Em contato", "Em negociação", "Fechado", "Perdido"];

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(100),
  empresa: z.string().trim().max(100),
  valor: z.coerce.number({ invalid_type_error: "Valor inválido" }).min(0, "Valor inválido").max(1e10),
  etapa: z.string().min(1),
});

export function NewLeadForm() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ nome: "", empresa: "", valor: "", etapa: "Novo" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setSaving(true);
    const { error } = await leadsDb.from("leads").insert(parsed.data);
    setSaving(false);
    if (error) return setError("Não foi possível salvar: " + error.message);
    setForm({ nome: "", empresa: "", valor: "", etapa: "Novo" });
    await qc.invalidateQueries({ queryKey: ["leads"] });
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">Novo lead</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input placeholder="Nome" value={form.nome} onChange={set("nome")} aria-label="Nome" />
        <Input placeholder="Empresa" value={form.empresa} onChange={set("empresa")} aria-label="Empresa" />
        <Input placeholder="Valor (R$)" type="number" min="0" step="0.01" value={form.valor} onChange={set("valor")} aria-label="Valor" />
        <select
          value={form.etapa}
          onChange={set("etapa")}
          aria-label="Etapa"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          {ETAPAS.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar lead"}
        </Button>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </form>
  );
}
