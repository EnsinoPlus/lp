-- Tabela de leads da campanha 10 do 10 (V1 página 1 e V2 checkout).
-- Rodar no SQL Editor do Supabase do cliente (Dashboard → SQL).
-- O insert é feito server-side com a SERVICE ROLE KEY (ignora RLS).

create table if not exists public.promo1010_leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  stage        text not null check (stage in ('page1', 'checkout')),
  name         text,
  email        text not null,
  phone        text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  origem       text,
  gclid        text,
  attribution  jsonb,   -- atribuição de marketing completa (UTMs, gclid, origem)
  url_params   jsonb,   -- TODOS os parâmetros presentes na URL no momento do cadastro
  landing_page text
);

create index if not exists promo1010_leads_email_idx   on public.promo1010_leads (email);
create index if not exists promo1010_leads_stage_idx   on public.promo1010_leads (stage);
create index if not exists promo1010_leads_created_idx on public.promo1010_leads (created_at desc);

-- RLS: ninguém lê/escreve via chave anônima por padrão.
-- O service_role (usado no servidor) ignora RLS e consegue inserir.
alter table public.promo1010_leads enable row level security;

-- (Opcional) Se você preferir inserir com a ANON KEY direto do cliente,
-- descomente a policy abaixo para permitir apenas INSERT anônimo:
-- create policy "promo1010_insert_anon" on public.promo1010_leads
--   for insert to anon, authenticated with check (true);
