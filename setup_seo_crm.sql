-- CRM de Oportunidades SEO e Monitoramento - Tabela Supabase
-- Rodar este script no Editor SQL do Supabase.

CREATE TABLE IF NOT EXISTS public.seo_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
    repo_name TEXT NOT NULL,
    keyword TEXT NOT NULL,
    article_title TEXT NOT NULL,
    article_url TEXT NOT NULL,
    position INTEGER NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr NUMERIC(5,2) DEFAULT 0.00,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, repo_name, keyword, article_url)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.seo_opportunities ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE OR REPLACE POLICY "Permitir tudo para o proprietário" 
ON public.seo_opportunities
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_seo_opp_user_id ON public.seo_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_opp_repo_name ON public.seo_opportunities(repo_name);
CREATE INDEX IF NOT EXISTS idx_seo_opp_position ON public.seo_opportunities(position);
