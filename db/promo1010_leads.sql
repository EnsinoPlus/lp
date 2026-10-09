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

-- ===== Acesso às LISTAS individuais (PII) via token =====
-- Usado pelo dashboard (/relatorio-promo-1010?token=...).
create table if not exists public.promo1010_dashboard_access (
  id int primary key default 1,
  token text not null
);
alter table public.promo1010_dashboard_access enable row level security; -- anon não lê

insert into public.promo1010_dashboard_access (id, token)
values (1, 'b7promo1010-f3a9c2e7d5b14a6c')
on conflict (id) do update set token = excluded.token;

-- Retorna os leads individuais só quando o token confere (SECURITY DEFINER).
create or replace function public.promo1010_recent_leads(p_token text, p_limit int default 1000)
returns setof public.promo1010_leads
language plpgsql security definer set search_path = public as $$
begin
  if p_token is null
     or p_token <> (select token from public.promo1010_dashboard_access where id = 1) then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  return query select * from public.promo1010_leads
    order by created_at desc limit greatest(1, least(p_limit, 5000));
end; $$;

revoke all on function public.promo1010_recent_leads(text, int) from public;
grant execute on function public.promo1010_recent_leads(text, int) to anon, authenticated;

-- ===== Acessos, cadastros parciais e completos =====
alter table public.promo1010_leads add column if not exists status text not null default 'completo';
alter table public.promo1010_leads add column if not exists visitor_id text;
alter table public.promo1010_leads alter column email drop not null;
-- constraints: status valido e ao menos email OU telefone
--   promo1010_status_chk: status in ('parcial','completo')
--   promo1010_contact_chk: email is not null or phone is not null
create unique index if not exists promo1010_leads_visitor_stage_uq
  on public.promo1010_leads (visitor_id, stage);

-- Acessos à página (page views)
create table if not exists public.promo1010_visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  visitor_id text,
  stage text not null check (stage in ('page1','checkout')),
  utm_source text, utm_medium text, utm_campaign text, origem text,
  url_params jsonb, landing_page text
);
alter table public.promo1010_visits enable row level security;
grant insert on public.promo1010_visits to anon, authenticated;
create policy promo1010_visits_insert on public.promo1010_visits
  for insert to anon, authenticated with check (true);

-- Upsert do lead (parcial -> completo) via funcao controlada (anon so executa).
-- Ver corpo completo aplicado no banco: public.promo1010_upsert_lead(...).

-- Views: promo1010_funnel (agora com coluna status) e promo1010_acessos
--   (count(*) as acessos, count(distinct visitor_id) as visitantes).

-- ===== FIX: identidade do lead = contato (email ou telefone), nao visitor_id =====
drop index if exists public.promo1010_leads_visitor_stage_uq;
alter table public.promo1010_leads
  add column if not exists contact_key text
  generated always as (coalesce(lower(nullif(email,'')), nullif(phone,''))) stored;
create unique index if not exists promo1010_leads_contact_stage_uq
  on public.promo1010_leads (stage, contact_key);
-- promo1010_upsert_lead reescrita com ON CONFLICT (stage, contact_key);
-- UTM/origem vindas da URL ATUAL do cadastro (client), nao do first-touch.

-- ===== Etapa RESSACA (pagina 11/10) =====
-- stage agora aceita (page1, checkout, ressaca) em leads e visits; RPC idem.
