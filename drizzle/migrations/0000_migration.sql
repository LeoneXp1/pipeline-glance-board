CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  empresa text NOT NULL DEFAULT '',
  valor numeric(12,2) NOT NULL DEFAULT 0,
  etapa text NOT NULL DEFAULT 'Novo',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leads visíveis publicamente" ON public.leads FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.leads (nome, empresa, valor, etapa) VALUES
('Mariana Costa','Agro Vale',48000,'Negociação'),
('Rafael Lima','TechNova',125000,'Proposta'),
('Juliana Alves','Clínica Bem Estar',18500,'Qualificação'),
('Pedro Santos','Logística Sul',72000,'Novo'),
('Camila Rocha','Construtora Alfa',210000,'Fechado'),
('Bruno Ferreira','Mercado Bom Preço',9500,'Perdido');