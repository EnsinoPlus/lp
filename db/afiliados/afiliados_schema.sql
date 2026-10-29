-- ============================================================================
-- SISTEMA DE AFILIADOS — Calc Machine Connect (Ensino Plus)
--
-- Rodar no Supabase do sistema de Assinaturas (onde estão usuários, planos e a
-- integração com o Asaas). Postgres 15+. Pode rodar mais de uma vez.
--
-- Premissas (ajuste se o schema de vocês for diferente):
--   * Usuários em auth.users(id uuid). Se usam outra tabela de usuários,
--     troque os "references auth.users(id)".
--   * Produtos/planos têm id próprio (ex.: 7 = Anual). Guardado como text em product_id.
--   * O backend fala com o Asaas e chama as funções "backend" com a service_role.
--   * Quem é admin de afiliados fica em affiliate_admins (troque af_is_admin()
--     pela regra de papéis que vocês já usam, se preferirem).
--
-- Ver LEIAME.md para o fluxo completo (link → checkout → split → webhook).
-- ============================================================================

begin;

create extension if not exists pgcrypto with schema extensions;

-- ----------------------------------------------------------------------------
-- Tipos
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.affiliate_status as enum ('pending', 'active', 'suspended', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.affiliate_commission_type as enum ('percentage', 'fixed');
exception when duplicate_object then null; end $$;

-- first_payment: só a 1ª cobrança (no parcelado, todas as parcelas da 1ª venda)
-- all_payments: todas as cobranças, inclusive renovações
-- first_n_payments: as N primeiras cobranças da assinatura
do $$ begin
  create type public.affiliate_commission_scope as enum ('first_payment', 'all_payments', 'first_n_payments');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.affiliate_payout_method as enum ('asaas_split', 'manual');
exception when duplicate_object then null; end $$;

-- expected:  cobrança criada, cliente ainda não pagou
-- confirmed: cliente pagou
-- paid_out:  comissão chegou ao afiliado (split concluído no Asaas ou repasse manual pago)
-- cancelled: estorno, chargeback ou cobrança removida
-- refused:   o Asaas recusou o split (ex.: carteira inválida); precisa de ação manual
do $$ begin
  create type public.affiliate_commission_status as enum ('expected', 'confirmed', 'paid_out', 'cancelled', 'refused');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.affiliate_payout_status as enum ('open', 'paid', 'cancelled');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- Tabelas
-- ----------------------------------------------------------------------------

-- Quem administra o programa de afiliados.
create table if not exists public.affiliate_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- O afiliado é um novo "tipo" de usuário: 1 linha por usuário que é afiliado.
create table if not exists public.affiliates (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references auth.users(id) on delete restrict,
  -- slug do link principal: /calc-machine-connect/p/{slug}. IMUTÁVEL (garante a atribuição).
  slug                     text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'),
  display_name             text not null,
  email                    text not null,
  phone                    text,
  document                 text,                -- CPF/CNPJ, só dígitos
  status                   public.affiliate_status not null default 'pending',
  -- comissão padrão do afiliado (regras por produto em affiliate_commission_rules têm prioridade)
  commission_type          public.affiliate_commission_type not null default 'percentage',
  commission_value         numeric(10,4) not null default 0 check (commission_value >= 0),
  commission_scope         public.affiliate_commission_scope not null default 'all_payments',
  commission_max_payments  int check (commission_max_payments > 0),
  payout_method            public.affiliate_payout_method not null default 'asaas_split',
  asaas_account_id         text,               -- subconta do afiliado no Asaas
  asaas_wallet_id          text unique,        -- walletId usado no split
  asaas_account_status     text,               -- status de aprovação (KYC) da subconta
  pix_key                  text,               -- só para repasse manual
  notes                    text,
  approved_by              uuid references auth.users(id),
  approved_at              timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint affiliates_percentage_max check (commission_type <> 'percentage' or commission_value <= 100),
  constraint affiliates_scope_n check (commission_scope <> 'first_n_payments' or commission_max_payments is not null),
  constraint affiliates_wallet_required check (
    status <> 'active' or payout_method <> 'asaas_split' or asaas_wallet_id is not null)
);

-- Regras de comissão por produto.
-- affiliate_id preenchido = regra daquele afiliado para o produto;
-- affiliate_id nulo       = regra padrão do produto para todos os afiliados.
create table if not exists public.affiliate_commission_rules (
  id                       uuid primary key default gen_random_uuid(),
  affiliate_id             uuid references public.affiliates(id) on delete cascade,
  product_id               text not null,
  commission_type          public.affiliate_commission_type not null default 'percentage',
  commission_value         numeric(10,4) not null check (commission_value >= 0),
  commission_scope         public.affiliate_commission_scope not null default 'all_payments',
  commission_max_payments  int check (commission_max_payments > 0),
  active                   boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint rules_percentage_max check (commission_type <> 'percentage' or commission_value <= 100),
  constraint rules_scope_n check (commission_scope <> 'first_n_payments' or commission_max_payments is not null)
);
create unique index if not exists affiliate_rules_aff_prod_uq
  on public.affiliate_commission_rules (affiliate_id, product_id) where affiliate_id is not null;
create unique index if not exists affiliate_rules_prod_default_uq
  on public.affiliate_commission_rules (product_id) where affiliate_id is null;

-- Links do afiliado. O link principal é criado automaticamente com o slug do afiliado.
-- Links extras (por campanha) começam com "{slug-do-afiliado}-".
-- slug e affiliate_id são IMUTÁVEIS: um link sempre aponta para o mesmo afiliado.
create table if not exists public.affiliate_links (
  id            uuid primary key default gen_random_uuid(),
  affiliate_id  uuid not null references public.affiliates(id) on delete cascade,
  slug          text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$'),
  product_id    text,                         -- produto em destaque na página (opcional)
  landing_path  text not null default '/calc-machine-connect',
  campaign      text,
  is_primary    boolean not null default false,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index if not exists affiliate_links_primary_uq
  on public.affiliate_links (affiliate_id) where is_primary;

-- Cliques/visitas nos links.
create table if not exists public.affiliate_clicks (
  id            bigint generated always as identity primary key,
  link_id       uuid not null references public.affiliate_links(id) on delete cascade,
  affiliate_id  uuid not null references public.affiliates(id) on delete cascade,
  visitor_id    text,
  ip_hash       text,                         -- sha256 do IP (não guarda o IP)
  user_agent    text,
  referrer      text,
  landing_url   text,
  utm           jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists affiliate_clicks_aff_idx  on public.affiliate_clicks (affiliate_id, created_at desc);
create index if not exists affiliate_clicks_link_idx on public.affiliate_clicks (link_id, created_at desc);
create index if not exists affiliate_clicks_dedupe_idx on public.affiliate_clicks (link_id, visitor_id, created_at desc);

-- Venda atribuída: liga o cliente/assinatura/parcelamento do Asaas ao afiliado.
-- Renovações da mesma assinatura e parcelas do mesmo parcelamento herdam o afiliado.
create table if not exists public.affiliate_referrals (
  id                     uuid primary key default gen_random_uuid(),
  affiliate_id           uuid not null references public.affiliates(id) on delete restrict,
  link_id                uuid references public.affiliate_links(id) on delete set null,
  product_id             text,
  customer_user_id       uuid references auth.users(id) on delete set null,
  customer_email         text not null,
  customer_document      text,
  asaas_customer_id      text,
  asaas_subscription_id  text unique,
  asaas_installment_id   text unique,
  installment_count      int check (installment_count > 0),
  visitor_id             text,
  utm                    jsonb,
  created_at             timestamptz not null default now()
);
create index if not exists affiliate_referrals_aff_idx   on public.affiliate_referrals (affiliate_id, created_at desc);
create index if not exists affiliate_referrals_email_idx on public.affiliate_referrals (customer_email);

-- Fechamentos de repasse (para afiliados com repasse manual; no split o Asaas já repassa).
create table if not exists public.affiliate_payouts (
  id                 uuid primary key default gen_random_uuid(),
  affiliate_id       uuid not null references public.affiliates(id) on delete restrict,
  period_start       date,
  period_end         date not null,
  total_amount       numeric(12,2) not null default 0,
  commissions_count  int not null default 0,
  status             public.affiliate_payout_status not null default 'open',
  method             public.affiliate_payout_method not null default 'manual',
  paid_at            timestamptz,
  paid_by            uuid references auth.users(id),
  proof_url          text,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists affiliate_payouts_aff_idx on public.affiliate_payouts (affiliate_id, created_at desc);

-- Uma comissão por cobrança do Asaas. Guarda um "retrato" da regra no momento da
-- venda, então mudar a % depois não altera o histórico.
create table if not exists public.affiliate_commissions (
  id                       uuid primary key default gen_random_uuid(),
  affiliate_id             uuid not null references public.affiliates(id) on delete restrict,
  referral_id              uuid not null references public.affiliate_referrals(id) on delete restrict,
  link_id                  uuid references public.affiliate_links(id) on delete set null,
  product_id               text,
  asaas_payment_id         text not null unique,
  asaas_installment_id     text,
  installment_number       int,
  payment_sequence         int not null default 1,   -- n-ésima cobrança da assinatura
  billing_type             text,                     -- PIX | CREDIT_CARD | BOLETO
  gross_value              numeric(12,2),
  net_value                numeric(12,2),            -- valor líquido (após taxas do Asaas)
  commission_type          public.affiliate_commission_type not null,
  commission_rate          numeric(10,4) not null,
  commission_scope         public.affiliate_commission_scope not null,
  commission_max_payments  int,
  commission_amount        numeric(12,2) not null default 0,
  payout_method            public.affiliate_payout_method not null,
  split_wallet_id          text,
  asaas_split_id           text,
  split_status             text,                     -- status do split vindo do Asaas
  split_refusal_reason     text,
  status                   public.affiliate_commission_status not null default 'expected',
  due_date                 date,
  paid_at                  timestamptz,              -- cliente pagou
  credited_at              timestamptz,              -- comissão chegou ao afiliado
  cancelled_at             timestamptz,
  cancel_reason            text,
  payout_id                uuid references public.affiliate_payouts(id) on delete set null,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index if not exists affiliate_commissions_aff_idx    on public.affiliate_commissions (affiliate_id, created_at desc);
create index if not exists affiliate_commissions_ref_idx    on public.affiliate_commissions (referral_id);
create index if not exists affiliate_commissions_status_idx on public.affiliate_commissions (status);
create index if not exists affiliate_commissions_payout_idx on public.affiliate_commissions (payout_id);

-- Eventos de webhook do Asaas (idempotência e auditoria).
create table if not exists public.asaas_webhook_events (
  id              bigint generated always as identity primary key,
  asaas_event_id  text unique,
  event           text not null,
  payment_id      text,
  payload         jsonb,
  received_at     timestamptz not null default now(),
  processed_at    timestamptz,
  error           text
);
create index if not exists asaas_webhook_events_payment_idx on public.asaas_webhook_events (payment_id);

-- Histórico de alterações (quem mudou % de comissão, status, carteira etc.).
create table if not exists public.affiliate_audit_log (
  id             bigint generated always as identity primary key,
  actor_user_id  uuid,
  table_name     text not null,
  record_id      uuid,
  action         text not null,
  old_data       jsonb,
  new_data       jsonb,
  created_at     timestamptz not null default now()
);
create index if not exists affiliate_audit_record_idx on public.affiliate_audit_log (record_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Funções auxiliares e triggers
-- ----------------------------------------------------------------------------

create or replace function public.af_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create or replace function public.af_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.affiliate_admins where user_id = auth.uid());
$$;

create or replace function public.af_my_affiliate_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.affiliates where user_id = auth.uid();
$$;

-- O slug do afiliado não muda: é ele que garante a atribuição.
create or replace function public.af_lock_affiliate_slug() returns trigger
language plpgsql as $$
begin
  if new.slug is distinct from old.slug then
    raise exception 'slug_imutavel: o slug do afiliado define a atribuição e não pode mudar';
  end if;
  return new;
end $$;

-- Um link nunca troca de slug nem de dono (desative e crie outro).
create or replace function public.af_lock_link() returns trigger
language plpgsql as $$
begin
  if new.slug is distinct from old.slug or new.affiliate_id is distinct from old.affiliate_id then
    raise exception 'link_imutavel: slug e afiliado do link não podem mudar; desative e crie outro';
  end if;
  return new;
end $$;

-- Cria o link principal (/calc-machine-connect/p/{slug}) junto com o afiliado.
create or replace function public.af_create_primary_link() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.affiliate_links (affiliate_id, slug, is_primary)
  values (new.id, new.slug, true);
  return new;
end $$;

create or replace function public.af_audit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    insert into public.affiliate_audit_log (actor_user_id, table_name, record_id, action, old_data)
    values (auth.uid(), tg_table_name, old.id, tg_op, to_jsonb(old));
    return old;
  elsif tg_op = 'UPDATE' then
    insert into public.affiliate_audit_log (actor_user_id, table_name, record_id, action, old_data, new_data)
    values (auth.uid(), tg_table_name, new.id, tg_op, to_jsonb(old), to_jsonb(new));
  else
    insert into public.affiliate_audit_log (actor_user_id, table_name, record_id, action, new_data)
    values (auth.uid(), tg_table_name, new.id, tg_op, to_jsonb(new));
  end if;
  return new;
end $$;

drop trigger if exists affiliates_touch on public.affiliates;
create trigger affiliates_touch before update on public.affiliates
  for each row execute function public.af_touch_updated_at();
drop trigger if exists affiliates_lock_slug on public.affiliates;
create trigger affiliates_lock_slug before update on public.affiliates
  for each row execute function public.af_lock_affiliate_slug();
drop trigger if exists affiliates_primary_link on public.affiliates;
create trigger affiliates_primary_link after insert on public.affiliates
  for each row execute function public.af_create_primary_link();
drop trigger if exists affiliates_audit on public.affiliates;
create trigger affiliates_audit after insert or update or delete on public.affiliates
  for each row execute function public.af_audit();

drop trigger if exists rules_touch on public.affiliate_commission_rules;
create trigger rules_touch before update on public.affiliate_commission_rules
  for each row execute function public.af_touch_updated_at();
drop trigger if exists rules_audit on public.affiliate_commission_rules;
create trigger rules_audit after insert or update or delete on public.affiliate_commission_rules
  for each row execute function public.af_audit();

drop trigger if exists links_touch on public.affiliate_links;
create trigger links_touch before update on public.affiliate_links
  for each row execute function public.af_touch_updated_at();
drop trigger if exists links_lock on public.affiliate_links;
create trigger links_lock before update on public.affiliate_links
  for each row execute function public.af_lock_link();

drop trigger if exists payouts_touch on public.affiliate_payouts;
create trigger payouts_touch before update on public.affiliate_payouts
  for each row execute function public.af_touch_updated_at();

drop trigger if exists commissions_touch on public.affiliate_commissions;
create trigger commissions_touch before update on public.affiliate_commissions
  for each row execute function public.af_touch_updated_at();

-- ----------------------------------------------------------------------------
-- Regra de comissão
-- Prioridade: regra afiliado+produto > padrão do afiliado > padrão do produto.
-- ----------------------------------------------------------------------------
create or replace function public.af_resolve_commission(p_affiliate_id uuid, p_product_id text)
returns table (
  commission_type          public.affiliate_commission_type,
  commission_value         numeric,
  commission_scope         public.affiliate_commission_scope,
  commission_max_payments  int
)
language sql stable security definer set search_path = public as $$
  select x.commission_type, x.commission_value, x.commission_scope, x.commission_max_payments
  from (
    select r.commission_type, r.commission_value, r.commission_scope, r.commission_max_payments, 1 as prio
      from public.affiliate_commission_rules r
     where r.active and r.affiliate_id = p_affiliate_id and r.product_id = p_product_id
    union all
    select a.commission_type, a.commission_value, a.commission_scope, a.commission_max_payments, 2
      from public.affiliates a
     where a.id = p_affiliate_id and a.commission_value > 0
    union all
    select r.commission_type, r.commission_value, r.commission_scope, r.commission_max_payments, 3
      from public.affiliate_commission_rules r
     where r.active and r.affiliate_id is null and r.product_id = p_product_id
  ) x
  order by x.prio
  limit 1;
$$;

-- ----------------------------------------------------------------------------
-- PÚBLICO (anon): usado pela página /calc-machine-connect/p/{slug}
-- ----------------------------------------------------------------------------

-- Valida o link e devolve o que a página precisa (sem dados sensíveis).
create or replace function public.af_resolve_link(p_slug text)
returns table (link_slug text, affiliate_name text, product_id text, landing_path text)
language sql stable security definer set search_path = public as $$
  select l.slug, a.display_name, l.product_id, l.landing_path
    from public.affiliate_links l
    join public.affiliates a on a.id = l.affiliate_id
   where l.slug = lower(btrim(p_slug)) and l.active and a.status = 'active';
$$;

-- Registra a visita no link. Mesmo visitante no mesmo link em 30 min = 1 clique.
create or replace function public.af_track_click(
  p_slug         text,
  p_visitor_id   text  default null,
  p_referrer     text  default null,
  p_landing_url  text  default null,
  p_utm          jsonb default null,
  p_user_agent   text  default null
) returns boolean
language plpgsql volatile security definer set search_path = public, extensions as $$
declare
  v_link public.affiliate_links%rowtype;
  v_ip   text;
begin
  select l.* into v_link
    from public.affiliate_links l
    join public.affiliates a on a.id = l.affiliate_id
   where l.slug = lower(btrim(p_slug)) and l.active and a.status = 'active';
  if not found then
    return false;
  end if;

  if p_visitor_id is not null and exists (
       select 1 from public.affiliate_clicks c
        where c.link_id = v_link.id and c.visitor_id = p_visitor_id
          and c.created_at > now() - interval '30 minutes') then
    return true;
  end if;

  begin
    v_ip := btrim(split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1));
  exception when others then
    v_ip := null;
  end;

  insert into public.affiliate_clicks (link_id, affiliate_id, visitor_id, ip_hash, user_agent, referrer, landing_url, utm)
  values (
    v_link.id, v_link.affiliate_id, left(p_visitor_id, 64),
    case when coalesce(v_ip, '') = '' then null else encode(digest(v_ip, 'sha256'), 'hex') end,
    left(p_user_agent, 300), left(p_referrer, 500), left(p_landing_url, 500), p_utm
  );
  return true;
end $$;

-- ----------------------------------------------------------------------------
-- BACKEND (service_role): checkout, cobrança e webhook do Asaas
-- ----------------------------------------------------------------------------

-- Chamar ANTES de criar a cobrança/assinatura no Asaas.
-- Devolve o array pronto para o campo "split" do Asaas (asaas_split) e a tag
-- para o externalReference. Devolve null se o link não existe ou está inativo.
-- p_installment_count: nº de parcelas no cartão (comissão fixa é dividida por parcela).
create or replace function public.af_checkout_split(
  p_link_slug          text,
  p_product_id         text,
  p_installment_count  int default 1
) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_link  public.affiliate_links%rowtype;
  v_aff   public.affiliates%rowtype;
  v_rule  record;
  v_split jsonb;
  v_n     int := greatest(coalesce(p_installment_count, 1), 1);
begin
  if coalesce(btrim(p_link_slug), '') = '' then
    return null;
  end if;

  select * into v_link from public.affiliate_links where slug = lower(btrim(p_link_slug)) and active;
  if not found then
    return null;
  end if;

  select * into v_aff from public.affiliates where id = v_link.affiliate_id and status = 'active';
  if not found then
    return null;
  end if;

  select * into v_rule from public.af_resolve_commission(v_aff.id, p_product_id);
  if not found or coalesce(v_rule.commission_value, 0) <= 0 then
    return jsonb_build_object('eligible', false, 'affiliate_id', v_aff.id, 'link_id', v_link.id,
                              'reason', 'sem_regra_de_comissao', 'asaas_split', null,
                              'external_reference_tag', 'aff:' || v_link.slug);
  end if;

  if v_aff.payout_method = 'asaas_split' then
    v_split := jsonb_build_array(
      case when v_rule.commission_type = 'percentage'
           then jsonb_build_object('walletId', v_aff.asaas_wallet_id, 'percentualValue', v_rule.commission_value)
           else jsonb_build_object('walletId', v_aff.asaas_wallet_id, 'fixedValue', round(v_rule.commission_value / v_n, 2))
      end);
  end if;

  return jsonb_build_object(
    'eligible',                true,
    'affiliate_id',            v_aff.id,
    'affiliate_slug',          v_aff.slug,
    'link_id',                 v_link.id,
    'link_slug',               v_link.slug,
    'payout_method',           v_aff.payout_method,
    'commission_type',         v_rule.commission_type,
    'commission_value',        v_rule.commission_value,
    'commission_scope',        v_rule.commission_scope,
    'commission_max_payments', v_rule.commission_max_payments,
    'asaas_split',             v_split,              -- vai direto no campo "split" (null = sem split)
    'external_reference_tag',  'aff:' || v_link.slug -- incluir no externalReference da cobrança
  );
end $$;

-- Interno: cria a comissão de UMA cobrança, aplicando escopo e retrato da regra.
create or replace function public.af__create_commission(
  p_referral_id         uuid,
  p_asaas_payment_id    text,
  p_billing_type        text,
  p_gross_value         numeric,
  p_due_date            date,
  p_installment_number  int
) returns uuid
language plpgsql volatile security definer set search_path = public as $$
declare
  v_ref    public.affiliate_referrals%rowtype;
  v_aff    public.affiliates%rowtype;
  v_rule   record;
  v_seq    int;
  v_amount numeric(12,2);
  v_id     uuid;
begin
  select id into v_id from public.affiliate_commissions where asaas_payment_id = p_asaas_payment_id;
  if found then
    return v_id;
  end if;

  select * into v_ref from public.affiliate_referrals where id = p_referral_id;
  if not found then
    return null;
  end if;
  select * into v_aff from public.affiliates where id = v_ref.affiliate_id;

  select * into v_rule from public.af_resolve_commission(v_aff.id, v_ref.product_id);
  if not found or coalesce(v_rule.commission_value, 0) <= 0 then
    return null;
  end if;

  -- Parcelado no cartão = uma venda só: todas as parcelas contam como 1ª cobrança.
  if v_ref.asaas_installment_id is not null then
    v_seq := 1;
  else
    select count(*) + 1 into v_seq
      from public.affiliate_commissions
     where referral_id = v_ref.id and status <> 'cancelled';
  end if;

  if v_rule.commission_scope = 'first_payment' and v_seq > 1 then
    return null;
  end if;
  if v_rule.commission_scope = 'first_n_payments' and v_seq > v_rule.commission_max_payments then
    return null;
  end if;

  v_amount := case
    when v_rule.commission_type = 'percentage'
      then round(coalesce(p_gross_value, 0) * v_rule.commission_value / 100, 2)
    else round(v_rule.commission_value / greatest(coalesce(v_ref.installment_count, 1), 1), 2)
  end;

  insert into public.affiliate_commissions (
    affiliate_id, referral_id, link_id, product_id, asaas_payment_id, asaas_installment_id,
    installment_number, payment_sequence, billing_type, gross_value,
    commission_type, commission_rate, commission_scope, commission_max_payments, commission_amount,
    payout_method, split_wallet_id, status, due_date
  ) values (
    v_aff.id, v_ref.id, v_ref.link_id, v_ref.product_id, p_asaas_payment_id, v_ref.asaas_installment_id,
    p_installment_number, v_seq, p_billing_type, p_gross_value,
    v_rule.commission_type, v_rule.commission_value, v_rule.commission_scope, v_rule.commission_max_payments, v_amount,
    v_aff.payout_method,
    case when v_aff.payout_method = 'asaas_split' then v_aff.asaas_wallet_id end,
    'expected', p_due_date
  )
  on conflict (asaas_payment_id) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from public.affiliate_commissions where asaas_payment_id = p_asaas_payment_id;
  end if;
  return v_id;
end $$;

-- Chamar LOGO DEPOIS de criar a cobrança/assinatura/parcelamento no Asaas.
-- Registra a venda atribuída e, se já houver id de cobrança, a comissão prevista.
-- Em assinatura, pode chamar sem p_asaas_payment_id: as cobranças entram pelo webhook.
create or replace function public.af_register_charge(
  p_link_slug              text,
  p_product_id             text,
  p_customer_email         text,
  p_asaas_payment_id       text    default null,
  p_gross_value            numeric default null,
  p_billing_type           text    default null,
  p_due_date               date    default null,
  p_asaas_customer_id      text    default null,
  p_asaas_subscription_id  text    default null,
  p_asaas_installment_id   text    default null,
  p_installment_count      int     default null,
  p_installment_number     int     default null,
  p_customer_document      text    default null,
  p_customer_user_id       uuid    default null,
  p_visitor_id             text    default null,
  p_utm                    jsonb   default null
) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_link   public.affiliate_links%rowtype;
  v_ref_id uuid;
  v_cm_id  uuid;
begin
  if coalesce(btrim(p_link_slug), '') = '' then
    return jsonb_build_object('affiliate', false);
  end if;

  select l.* into v_link
    from public.affiliate_links l
    join public.affiliates a on a.id = l.affiliate_id
   where l.slug = lower(btrim(p_link_slug)) and l.active and a.status = 'active';
  if not found then
    return jsonb_build_object('affiliate', false, 'reason', 'link_invalido_ou_inativo');
  end if;

  if p_asaas_subscription_id is not null then
    select id into v_ref_id from public.affiliate_referrals where asaas_subscription_id = p_asaas_subscription_id;
  elsif p_asaas_installment_id is not null then
    select id into v_ref_id from public.affiliate_referrals where asaas_installment_id = p_asaas_installment_id;
  end if;

  if v_ref_id is null then
    insert into public.affiliate_referrals (
      affiliate_id, link_id, product_id, customer_user_id, customer_email, customer_document,
      asaas_customer_id, asaas_subscription_id, asaas_installment_id, installment_count, visitor_id, utm
    ) values (
      v_link.affiliate_id, v_link.id, p_product_id, p_customer_user_id, lower(btrim(p_customer_email)),
      nullif(regexp_replace(coalesce(p_customer_document, ''), '\D', '', 'g'), ''),
      p_asaas_customer_id, p_asaas_subscription_id, p_asaas_installment_id, p_installment_count,
      left(p_visitor_id, 64), p_utm
    )
    returning id into v_ref_id;
  end if;

  if p_asaas_payment_id is not null then
    v_cm_id := public.af__create_commission(v_ref_id, p_asaas_payment_id, p_billing_type,
                                            p_gross_value, p_due_date, p_installment_number);
  end if;

  return jsonb_build_object('affiliate', true, 'affiliate_id', v_link.affiliate_id,
                            'referral_id', v_ref_id, 'commission_id', v_cm_id);
end $$;

-- Chamar no webhook do Asaas com o evento e o objeto "payment" do corpo.
-- p_event_id = "id" do evento (idempotência: reenvio do mesmo evento é ignorado).
-- Se o retorno trouxer remove_split_from_subscription = true, o backend deve tirar
-- o split da assinatura no Asaas (o escopo da comissão já foi atingido).
create or replace function public.af_apply_payment_event(
  p_event     text,
  p_payment   jsonb,
  p_event_id  text default null
) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_payment_id text := p_payment ->> 'id';
  v_net        numeric := nullif(p_payment ->> 'netValue', '')::numeric;
  v_cm         public.affiliate_commissions%rowtype;
  v_ref        public.affiliate_referrals%rowtype;
  v_split      jsonb;
  v_remove     boolean := false;
  v_new_id     uuid;
begin
  if v_payment_id is null then
    return jsonb_build_object('ok', false, 'reason', 'payment_sem_id');
  end if;

  if p_event_id is not null then
    insert into public.asaas_webhook_events (asaas_event_id, event, payment_id, payload)
    values (p_event_id, p_event, v_payment_id, p_payment)
    on conflict (asaas_event_id) do nothing;
    if not found and exists (select 1 from public.asaas_webhook_events
                              where asaas_event_id = p_event_id and processed_at is not null) then
      return jsonb_build_object('ok', true, 'skipped', 'evento_ja_processado');
    end if;
  end if;

  select * into v_cm from public.affiliate_commissions where asaas_payment_id = v_payment_id;

  -- Cobrança nova de assinatura/parcelamento já atribuído (renovação ou parcela).
  if v_cm.id is null then
    select * into v_ref from public.affiliate_referrals r
     where (p_payment ->> 'subscription' is not null and r.asaas_subscription_id = p_payment ->> 'subscription')
        or (p_payment ->> 'installment'  is not null and r.asaas_installment_id  = p_payment ->> 'installment')
     limit 1;
    if v_ref.id is not null then
      v_new_id := public.af__create_commission(
        v_ref.id, v_payment_id, p_payment ->> 'billingType',
        nullif(p_payment ->> 'value', '')::numeric,
        nullif(p_payment ->> 'dueDate', '')::date,
        nullif(p_payment ->> 'installmentNumber', '')::int);
      if v_new_id is not null then
        select * into v_cm from public.affiliate_commissions where id = v_new_id;
      end if;
    end if;
  end if;

  if v_cm.id is null then
    update public.asaas_webhook_events set processed_at = now() where asaas_event_id = p_event_id;
    return jsonb_build_object('ok', true, 'affiliate', false);
  end if;

  if p_event in ('PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED', 'PAYMENT_RECEIVED_IN_CASH') then
    update public.affiliate_commissions set
      status = case when status = 'expected' then 'confirmed'::public.affiliate_commission_status else status end,
      paid_at = coalesce(paid_at, now()),
      net_value = coalesce(v_net, net_value),
      -- no Asaas o split percentual incide sobre o valor líquido
      commission_amount = case
        when commission_type = 'percentage' and v_net is not null
          then round(v_net * commission_rate / 100, 2)
        else commission_amount end
    where id = v_cm.id;
  elsif p_event in ('PAYMENT_REFUNDED', 'PAYMENT_REFUND_IN_PROGRESS', 'PAYMENT_DELETED',
                    'PAYMENT_CHARGEBACK_REQUESTED', 'PAYMENT_CHARGEBACK_DISPUTE') then
    update public.affiliate_commissions set
      status = 'cancelled',
      cancelled_at = coalesce(cancelled_at, now()),
      cancel_reason = p_event
    where id = v_cm.id;
  end if;

  -- Status do split do afiliado, quando vier no payload.
  if v_cm.split_wallet_id is not null then
    select e.value into v_split
      from jsonb_array_elements(coalesce(p_payment -> 'split', '[]'::jsonb)) as e(value)
     where e.value ->> 'walletId' = v_cm.split_wallet_id
     limit 1;
    if v_split is not null then
      update public.affiliate_commissions set
        asaas_split_id = coalesce(v_split ->> 'id', asaas_split_id),
        split_status = v_split ->> 'status',
        split_refusal_reason = v_split ->> 'refusalReason',
        status = case
          when status = 'cancelled' then status
          when v_split ->> 'status' = 'DONE'    then 'paid_out'::public.affiliate_commission_status
          when v_split ->> 'status' = 'REFUSED' then 'refused'::public.affiliate_commission_status
          else status end,
        credited_at = case when v_split ->> 'status' = 'DONE' then coalesce(credited_at, now()) else credited_at end
      where id = v_cm.id;
    end if;
  end if;

  select * into v_cm from public.affiliate_commissions where id = v_cm.id;
  select * into v_ref from public.affiliate_referrals where id = v_cm.referral_id;

  if v_cm.payout_method = 'asaas_split'
     and v_cm.status in ('confirmed', 'paid_out')
     and v_ref.asaas_subscription_id is not null then
    v_remove := coalesce(
      v_cm.commission_scope = 'first_payment'
      or (v_cm.commission_scope = 'first_n_payments' and v_cm.payment_sequence >= v_cm.commission_max_payments),
      false);
  end if;

  update public.asaas_webhook_events set processed_at = now() where asaas_event_id = p_event_id;

  return jsonb_build_object(
    'ok', true,
    'affiliate', true,
    'commission_id', v_cm.id,
    'status', v_cm.status,
    'remove_split_from_subscription', v_remove,
    'asaas_subscription_id', v_ref.asaas_subscription_id
  );
end $$;

-- ----------------------------------------------------------------------------
-- AFILIADO (authenticated): cadastro e tela de gestão própria
-- ----------------------------------------------------------------------------

-- Inscrição do próprio usuário como afiliado (fica "pending" até o admin aprovar).
create or replace function public.af_apply(
  p_slug          text,
  p_display_name  text,
  p_phone         text default null,
  p_document      text default null
) returns uuid
language plpgsql volatile security definer set search_path = public as $$
declare
  v_id    uuid;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'login_necessario';
  end if;
  select email into v_email from auth.users where id = auth.uid();

  insert into public.affiliates (user_id, slug, display_name, email, phone, document, status)
  values (auth.uid(), lower(btrim(p_slug)), btrim(p_display_name), v_email, p_phone,
          nullif(regexp_replace(coalesce(p_document, ''), '\D', '', 'g'), ''), 'pending')
  returning id into v_id;
  return v_id;
end $$;

-- O afiliado só altera dados de contato/repasse; % e status são do admin.
create or replace function public.af_update_my_profile(
  p_display_name  text default null,
  p_phone         text default null,
  p_pix_key       text default null
) returns void
language plpgsql volatile security definer set search_path = public as $$
begin
  update public.affiliates set
    display_name = coalesce(nullif(btrim(p_display_name), ''), display_name),
    phone        = coalesce(p_phone, phone),
    pix_key      = coalesce(p_pix_key, pix_key)
  where user_id = auth.uid();
  if not found then
    raise exception 'nao_e_afiliado';
  end if;
end $$;

-- Link extra por campanha. O slug precisa começar com "{slug-do-afiliado}-".
create or replace function public.af_create_link(
  p_slug          text,
  p_campaign      text default null,
  p_product_id    text default null,
  p_landing_path  text default '/calc-machine-connect'
) returns uuid
language plpgsql volatile security definer set search_path = public as $$
declare
  v_aff  public.affiliates%rowtype;
  v_slug text := lower(btrim(p_slug));
  v_id   uuid;
begin
  select * into v_aff from public.affiliates where user_id = auth.uid();
  if not found then
    raise exception 'nao_e_afiliado';
  end if;
  if v_aff.status <> 'active' then
    raise exception 'afiliado_inativo';
  end if;
  if v_slug not like v_aff.slug || '-%' then
    raise exception 'o slug do link precisa começar com "%-"', v_aff.slug;
  end if;

  insert into public.affiliate_links (affiliate_id, slug, product_id, landing_path, campaign)
  values (v_aff.id, v_slug, p_product_id, coalesce(p_landing_path, '/calc-machine-connect'), p_campaign)
  returning id into v_id;
  return v_id;
end $$;

-- Vendas/comissões do afiliado logado, com e-mail do cliente mascarado (LGPD).
create or replace function public.af_my_commissions(p_limit int default 500)
returns table (
  created_at          timestamptz,
  product_id          text,
  link_slug           text,
  customer            text,
  billing_type        text,
  payment_sequence    int,
  installment_number  int,
  gross_value         numeric,
  commission_amount   numeric,
  status              public.affiliate_commission_status,
  paid_at             timestamptz,
  credited_at         timestamptz
)
language sql stable security definer set search_path = public as $$
  select cm.created_at, cm.product_id, l.slug,
         regexp_replace(r.customer_email, '^(.).*(@.*)$', '\1***\2'),
         cm.billing_type, cm.payment_sequence, cm.installment_number,
         cm.gross_value, cm.commission_amount, cm.status, cm.paid_at, cm.credited_at
    from public.affiliate_commissions cm
    join public.affiliate_referrals r on r.id = cm.referral_id
    left join public.affiliate_links l on l.id = cm.link_id
   where cm.affiliate_id = public.af_my_affiliate_id()
   order by cm.created_at desc
   limit least(greatest(coalesce(p_limit, 500), 1), 2000);
$$;

-- ----------------------------------------------------------------------------
-- PAINÉIS (afiliado vê o próprio; admin vê todos)
-- ----------------------------------------------------------------------------

create or replace function public.af_dashboard()
returns table (
  affiliate_id          uuid,
  slug                  text,
  display_name          text,
  status                public.affiliate_status,
  clicks_total          bigint,
  clicks_30d            bigint,
  referrals             bigint,
  charges               bigint,
  paid_charges          bigint,
  revenue_gross         numeric,
  commission_expected   numeric,
  commission_confirmed  numeric,
  commission_paid_out   numeric,
  commission_cancelled  numeric,
  commission_refused    numeric
)
language sql stable security definer set search_path = public as $$
  select a.id, a.slug, a.display_name, a.status,
         (select count(*) from public.affiliate_clicks c where c.affiliate_id = a.id),
         (select count(*) from public.affiliate_clicks c
           where c.affiliate_id = a.id and c.created_at > now() - interval '30 days'),
         (select count(*) from public.affiliate_referrals r where r.affiliate_id = a.id),
         coalesce(m.charges, 0), coalesce(m.paid_charges, 0), coalesce(m.revenue_gross, 0),
         coalesce(m.c_expected, 0), coalesce(m.c_confirmed, 0), coalesce(m.c_paid_out, 0),
         coalesce(m.c_cancelled, 0), coalesce(m.c_refused, 0)
    from public.affiliates a
    left join lateral (
      select count(*) as charges,
             count(*) filter (where x.status in ('confirmed', 'paid_out')) as paid_charges,
             sum(x.gross_value) filter (where x.status in ('confirmed', 'paid_out')) as revenue_gross,
             sum(x.commission_amount) filter (where x.status = 'expected')  as c_expected,
             sum(x.commission_amount) filter (where x.status = 'confirmed') as c_confirmed,
             sum(x.commission_amount) filter (where x.status = 'paid_out')  as c_paid_out,
             sum(x.commission_amount) filter (where x.status = 'cancelled') as c_cancelled,
             sum(x.commission_amount) filter (where x.status = 'refused')   as c_refused
        from public.affiliate_commissions x
       where x.affiliate_id = a.id
    ) m on true
   where public.af_is_admin() or a.user_id = auth.uid()
   order by a.created_at;
$$;

-- Faturamento e comissões por mês (mês do pagamento; se não pago, da criação).
create or replace function public.af_monthly_report(
  p_from date default (date_trunc('month', now()) - interval '11 months')::date,
  p_to   date default current_date
)
returns table (
  month                date,
  affiliate_id         uuid,
  slug                 text,
  charges              bigint,
  paid_charges         bigint,
  revenue_gross        numeric,
  revenue_net          numeric,
  commission_total     numeric,
  commission_paid_out  numeric
)
language sql stable security definer set search_path = public as $$
  select date_trunc('month', coalesce(cm.paid_at, cm.created_at))::date,
         a.id, a.slug,
         count(*),
         count(*) filter (where cm.status in ('confirmed', 'paid_out')),
         coalesce(sum(cm.gross_value) filter (where cm.status in ('confirmed', 'paid_out')), 0),
         coalesce(sum(cm.net_value)   filter (where cm.status in ('confirmed', 'paid_out')), 0),
         coalesce(sum(cm.commission_amount) filter (where cm.status in ('confirmed', 'paid_out')), 0),
         coalesce(sum(cm.commission_amount) filter (where cm.status = 'paid_out'), 0)
    from public.affiliate_commissions cm
    join public.affiliates a on a.id = cm.affiliate_id
   where (public.af_is_admin() or a.user_id = auth.uid())
     and coalesce(cm.paid_at, cm.created_at)::date between p_from and p_to
   group by 1, a.id, a.slug
   order by 1 desc, a.slug;
$$;

-- ----------------------------------------------------------------------------
-- ADMIN: fechamento e pagamento de repasses manuais
-- ----------------------------------------------------------------------------

-- Junta as comissões confirmadas (repasse manual) até p_period_end num fechamento.
create or replace function public.af_close_payout(p_affiliate_id uuid, p_period_end date)
returns uuid
language plpgsql volatile security definer set search_path = public as $$
declare
  v_id    uuid;
  v_count int;
begin
  if not public.af_is_admin() then
    raise exception 'apenas_admin';
  end if;

  insert into public.affiliate_payouts (affiliate_id, period_end, method)
  values (p_affiliate_id, p_period_end, 'manual')
  returning id into v_id;

  update public.affiliate_commissions set payout_id = v_id
   where affiliate_id = p_affiliate_id
     and payout_method = 'manual'
     and status = 'confirmed'
     and payout_id is null
     and paid_at::date <= p_period_end;
  get diagnostics v_count = row_count;

  if v_count = 0 then
    raise exception 'nada_a_pagar: nenhuma comissão manual confirmada até %', p_period_end;
  end if;

  update public.affiliate_payouts p set
    commissions_count = v_count,
    total_amount = (select coalesce(sum(commission_amount), 0) from public.affiliate_commissions where payout_id = v_id),
    period_start = (select min(paid_at)::date from public.affiliate_commissions where payout_id = v_id)
  where p.id = v_id;

  return v_id;
end $$;

-- Marca o fechamento como pago e as comissões dele como repassadas.
create or replace function public.af_mark_payout_paid(p_payout_id uuid, p_proof_url text default null)
returns void
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.af_is_admin() then
    raise exception 'apenas_admin';
  end if;

  update public.affiliate_payouts set
    status = 'paid', paid_at = now(), paid_by = auth.uid(), proof_url = coalesce(p_proof_url, proof_url)
  where id = p_payout_id and status = 'open';
  if not found then
    raise exception 'fechamento_inexistente_ou_ja_pago';
  end if;

  update public.affiliate_commissions set
    status = 'paid_out', credited_at = coalesce(credited_at, now())
  where payout_id = p_payout_id and status = 'confirmed';
end $$;

-- ----------------------------------------------------------------------------
-- RLS
-- service_role (backend) ignora RLS. Afiliado vê só o que é dele; admin vê tudo.
-- Dados de clientes (affiliate_referrals) só o admin lê direto; o afiliado vê
-- mascarado via af_my_commissions().
-- ----------------------------------------------------------------------------
alter table public.affiliate_admins           enable row level security;
alter table public.affiliates                 enable row level security;
alter table public.affiliate_commission_rules enable row level security;
alter table public.affiliate_links            enable row level security;
alter table public.affiliate_clicks           enable row level security;
alter table public.affiliate_referrals        enable row level security;
alter table public.affiliate_payouts          enable row level security;
alter table public.affiliate_commissions      enable row level security;
alter table public.asaas_webhook_events       enable row level security;
alter table public.affiliate_audit_log        enable row level security;

drop policy if exists admins_admin_read on public.affiliate_admins;
create policy admins_admin_read on public.affiliate_admins
  for select to authenticated using (public.af_is_admin());

drop policy if exists affiliates_read on public.affiliates;
create policy affiliates_read on public.affiliates
  for select to authenticated using (user_id = auth.uid() or public.af_is_admin());
drop policy if exists affiliates_admin_write on public.affiliates;
create policy affiliates_admin_write on public.affiliates
  for all to authenticated using (public.af_is_admin()) with check (public.af_is_admin());

drop policy if exists rules_read on public.affiliate_commission_rules;
create policy rules_read on public.affiliate_commission_rules
  for select to authenticated using (affiliate_id = public.af_my_affiliate_id() or public.af_is_admin());
drop policy if exists rules_admin_write on public.affiliate_commission_rules;
create policy rules_admin_write on public.affiliate_commission_rules
  for all to authenticated using (public.af_is_admin()) with check (public.af_is_admin());

drop policy if exists links_read on public.affiliate_links;
create policy links_read on public.affiliate_links
  for select to authenticated using (affiliate_id = public.af_my_affiliate_id() or public.af_is_admin());
drop policy if exists links_admin_write on public.affiliate_links;
create policy links_admin_write on public.affiliate_links
  for all to authenticated using (public.af_is_admin()) with check (public.af_is_admin());

drop policy if exists clicks_read on public.affiliate_clicks;
create policy clicks_read on public.affiliate_clicks
  for select to authenticated using (affiliate_id = public.af_my_affiliate_id() or public.af_is_admin());

drop policy if exists referrals_admin on public.affiliate_referrals;
create policy referrals_admin on public.affiliate_referrals
  for all to authenticated using (public.af_is_admin()) with check (public.af_is_admin());

drop policy if exists payouts_read on public.affiliate_payouts;
create policy payouts_read on public.affiliate_payouts
  for select to authenticated using (affiliate_id = public.af_my_affiliate_id() or public.af_is_admin());
drop policy if exists payouts_admin_write on public.affiliate_payouts;
create policy payouts_admin_write on public.affiliate_payouts
  for all to authenticated using (public.af_is_admin()) with check (public.af_is_admin());

drop policy if exists commissions_read on public.affiliate_commissions;
create policy commissions_read on public.affiliate_commissions
  for select to authenticated using (affiliate_id = public.af_my_affiliate_id() or public.af_is_admin());
drop policy if exists commissions_admin_write on public.affiliate_commissions;
create policy commissions_admin_write on public.affiliate_commissions
  for all to authenticated using (public.af_is_admin()) with check (public.af_is_admin());

drop policy if exists webhook_admin_read on public.asaas_webhook_events;
create policy webhook_admin_read on public.asaas_webhook_events
  for select to authenticated using (public.af_is_admin());

drop policy if exists audit_admin_read on public.affiliate_audit_log;
create policy audit_admin_read on public.affiliate_audit_log
  for select to authenticated using (public.af_is_admin());

-- ----------------------------------------------------------------------------
-- Permissões das funções
-- ----------------------------------------------------------------------------

-- Públicas (página do link de afiliado)
revoke all on function public.af_resolve_link(text) from public;
revoke all on function public.af_track_click(text, text, text, text, jsonb, text) from public;
grant execute on function public.af_resolve_link(text) to anon, authenticated;
grant execute on function public.af_track_click(text, text, text, text, jsonb, text) to anon, authenticated;

-- Afiliado / admin logado (as próprias funções checam quem pode o quê)
revoke all on function public.af_apply(text, text, text, text) from public;
revoke all on function public.af_update_my_profile(text, text, text) from public;
revoke all on function public.af_create_link(text, text, text, text) from public;
revoke all on function public.af_my_commissions(int) from public;
revoke all on function public.af_dashboard() from public;
revoke all on function public.af_monthly_report(date, date) from public;
revoke all on function public.af_close_payout(uuid, date) from public;
revoke all on function public.af_mark_payout_paid(uuid, text) from public;
grant execute on function public.af_apply(text, text, text, text) to authenticated;
grant execute on function public.af_update_my_profile(text, text, text) to authenticated;
grant execute on function public.af_create_link(text, text, text, text) to authenticated;
grant execute on function public.af_my_commissions(int) to authenticated;
grant execute on function public.af_dashboard() to authenticated;
grant execute on function public.af_monthly_report(date, date) to authenticated;
grant execute on function public.af_close_payout(uuid, date) to authenticated;
grant execute on function public.af_mark_payout_paid(uuid, text) to authenticated;

-- Só backend (service_role)
revoke all on function public.af_checkout_split(text, text, int) from public, anon, authenticated;
revoke all on function public.af__create_commission(uuid, text, text, numeric, date, int) from public, anon, authenticated;
revoke all on function public.af_register_charge(text, text, text, text, numeric, text, date, text, text, text, int, int, text, uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.af_apply_payment_event(text, jsonb, text) from public, anon, authenticated;
grant execute on function public.af_checkout_split(text, text, int) to service_role;
grant execute on function public.af__create_commission(uuid, text, text, numeric, date, int) to service_role;
grant execute on function public.af_register_charge(text, text, text, text, numeric, text, date, text, text, text, int, int, text, uuid, text, jsonb) to service_role;
grant execute on function public.af_apply_payment_event(text, jsonb, text) to service_role;

-- Auxiliares usadas nas policies
grant execute on function public.af_is_admin() to anon, authenticated;
grant execute on function public.af_my_affiliate_id() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Documentação nas tabelas
-- ----------------------------------------------------------------------------
comment on table public.affiliates                 is 'Afiliados (novo tipo de usuário). slug = link principal /calc-machine-connect/p/{slug}, imutável.';
comment on table public.affiliate_commission_rules is 'Comissão por produto: por afiliado (affiliate_id) ou padrão do produto (affiliate_id nulo).';
comment on table public.affiliate_links            is 'Links do afiliado. slug e affiliate_id imutáveis: o link sempre atribui ao mesmo afiliado.';
comment on table public.affiliate_clicks           is 'Visitas nos links de afiliado (IP só em hash).';
comment on table public.affiliate_referrals        is 'Venda atribuída: cliente/assinatura/parcelamento do Asaas ligado ao afiliado.';
comment on table public.affiliate_commissions      is 'Uma comissão por cobrança do Asaas, com retrato da regra no momento da venda.';
comment on table public.affiliate_payouts          is 'Fechamentos de repasse manual. No split o Asaas repassa sozinho.';
comment on table public.asaas_webhook_events       is 'Eventos de webhook do Asaas recebidos (idempotência).';

-- Primeiro admin (troque pelo id do usuário de vocês):
-- insert into public.affiliate_admins (user_id) values ('00000000-0000-0000-0000-000000000000');

commit;
