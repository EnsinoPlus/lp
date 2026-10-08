-- Tabela de leads da campanha 10 do 10 (V1 página 1 e V2 checkout).
-- Aplicado no projeto Supabase da agência (sistema-b7 / rartcafydsaocdzshqcx).
-- O insert é feito server-side (REST) com a chave em SUPABASE_LEADS_KEY.

create extension if not exists pgcrypto;

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
  url_params   jsonb,   -- TODOS os parâmetros presentes na URL no cadastro
  landing_page text
);

create index if not exists promo1010_leads_email_idx   on public.promo1010_leads (email);
create index if not exists promo1010_leads_stage_idx   on public.promo1010_leads (stage);
create index if not exists promo1010_leads_created_idx on public.promo1010_leads (created_at desc);

-- RLS: a chave anônima só pode INSERIR (nunca ler os dados pessoais).
alter table public.promo1010_leads enable row level security;
grant insert on public.promo1010_leads to anon, authenticated;

drop policy if exists promo1010_insert_anon on public.promo1010_leads;
create policy promo1010_insert_anon on public.promo1010_leads
  for insert to anon, authenticated with check (true);

-- View agregada (SEM dados pessoais) usada pelo dashboard do funil.
create or replace view public.promo1010_funnel as
select
  (created_at at time zone 'America/Sao_Paulo')::date as dia,
  stage,
  coalesce(nullif(utm_source, ''), '(direto)')    as utm_source,
  coalesce(nullif(utm_medium, ''), '(nenhum)')    as utm_medium,
  coalesce(nullif(utm_campaign, ''), '(nenhuma)') as utm_campaign,
  coalesce(nullif(origem, ''), '(nenhuma)')       as origem,
  count(*) as total
from public.promo1010_leads
group by 1, 2, 3, 4, 5, 6;

grant select on public.promo1010_funnel to anon, authenticated;
