import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const leadsQuery = queryOptions({
  queryKey: ["leads"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("id, nome, empresa, valor, etapa")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CRM Comercial — Leads" },
      { name: "description", content: "Lista de leads com nome, empresa, valor e etapa do funil." },
      { property: "og:title", content: "CRM Comercial — Leads" },
      { property: "og:description", content: "Acompanhe seus leads e o funil de vendas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(leadsQuery),
  component: Index,
});

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const stageClass: Record<string, string> = {
  Novo: "bg-secondary text-secondary-foreground",
  Qualificação: "bg-accent text-accent-foreground",
  Proposta: "bg-primary/15 text-primary",
  Negociação: "bg-primary/25 text-primary",
  Fechado: "bg-primary text-primary-foreground",
  Perdido: "bg-destructive/15 text-destructive",
};

function Index() {
  const { data: leads } = useSuspenseQuery(leadsQuery);
  const total = leads.reduce((s, l) => s + Number(l.valor), 0);

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">CRM Comercial</p>
            <h1 className="mt-1 text-4xl font-bold text-foreground">Leads</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{leads.length} leads · pipeline</p>
            <p className="text-2xl font-semibold text-foreground">{brl.format(total)}</p>
          </div>
        </header>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Empresa</th>
                <th className="px-5 py-3 text-right font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Etapa</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t transition-colors hover:bg-muted/50">
                  <td className="px-5 py-4 font-medium text-card-foreground">{l.nome}</td>
                  <td className="px-5 py-4 text-muted-foreground">{l.empresa}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-card-foreground">
                    {brl.format(Number(l.valor))}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stageClass[l.etapa] ?? "bg-secondary text-secondary-foreground"}`}
                    >
                      {l.etapa}
                    </span>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                    Nenhum lead cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
