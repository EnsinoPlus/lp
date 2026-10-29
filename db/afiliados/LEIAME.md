# Sistema de Afiliados — Calc Machine Connect

Para o time do sistema de Assinaturas. O arquivo `afiliados_schema.sql` cria tudo no Supabase de vocês: tabelas, regras de comissão, funções, segurança (RLS) e painéis. Este documento explica como ligar isso ao checkout e ao Asaas.

## 1. O que o schema cria

| Tabela | Para quê |
|---|---|
| `affiliates` | O afiliado: um novo tipo de usuário, 1 linha por usuário (`user_id` → `auth.users`). Guarda slug, % padrão, carteira do Asaas e status. |
| `affiliate_links` | Links do afiliado. O principal é criado sozinho com o slug do afiliado. Dá pra ter links extras por campanha. |
| `affiliate_commission_rules` | Comissão por produto: específica de um afiliado ou padrão do produto para todos. |
| `affiliate_clicks` | Visitas nos links (IP guardado só como hash). |
| `affiliate_referrals` | A venda atribuída: liga cliente/assinatura/parcelamento do Asaas ao afiliado. |
| `affiliate_commissions` | Uma comissão por cobrança do Asaas, com o "retrato" da regra no momento da venda. |
| `affiliate_payouts` | Fechamentos de repasse para quem recebe manualmente (no split o Asaas repassa sozinho). |
| `asaas_webhook_events` | Eventos do webhook recebidos (evita processar o mesmo evento duas vezes). |
| `affiliate_admins` / `affiliate_audit_log` | Quem administra o programa e histórico de alterações. |

Premissas que vocês podem precisar ajustar:
- Usuários em `auth.users`. Se vocês têm outra tabela de usuários, troquem os `references auth.users(id)`.
- Produto/plano como texto em `product_id` (ex.: `"7"` = Anual).
- Admin de afiliados = quem está em `affiliate_admins`. Se já têm papéis de usuário, troquem o corpo de `af_is_admin()`.

## 2. Por que a atribuição não erra

1. Cada afiliado tem um caminho fixo: **`lp.ensinoplus.com.br/calc-machine-connect/p/{slug}`**.
2. O slug é **imutável**: há trigger que bloqueia a troca. Um link também nunca troca de dono. Para mudar, desativa e cria outro.
3. A página repassa o slug até o checkout, e o checkout manda `affiliateSlug` no `POST /subscribe`.
4. O backend coloca o **split direto na cobrança do Asaas**. A atribuição fica gravada no próprio pagamento, sem depender de cookie ou de adivinhação.
5. Renovações da assinatura e parcelas do cartão **herdam o afiliado** da venda original (`affiliate_referrals`).

## 3. O que o backend de Assinaturas precisa fazer

Todas as funções abaixo são chamadas com a **service_role**.

### 3.1 Cadastrar o afiliado com carteira no Asaas

Para o split funcionar, o afiliado precisa de um `walletId` no Asaas. Dois caminhos:
- **Subconta criada pela Ensino Plus** (`POST /v3/accounts`). A resposta traz `walletId`. A subconta precisa ser aprovada (KYC) antes de receber.
- **Conta própria do afiliado.** Ele informa o `walletId` da conta dele.

Salvar em `affiliates.asaas_account_id`, `asaas_wallet_id` e `asaas_account_status`. Há uma constraint que **impede ativar** um afiliado com repasse via split sem `asaas_wallet_id`.

Afiliado sem conta no Asaas pode ficar com `payout_method = 'manual'`: a comissão é calculada e paga por Pix no fechamento (seção 5).

### 3.2 `POST /api/public/mcp/subscribe`: aceitar o afiliado

Campos novos opcionais no corpo: `affiliateSlug`, `visitorId`, `utm`.

```js
// 1) Antes de criar a cobrança/assinatura no Asaas
const { data: aff } = await supabase.rpc('af_checkout_split', {
  p_link_slug: body.affiliateSlug ?? null,
  p_product_id: String(body.productId),
  p_installment_count: body.parcelas ?? 1,
});

// 2) Criar no Asaas incluindo o split e a marca no externalReference
const payload = {
  ...payloadNormal,
  ...(aff?.asaas_split ? { split: aff.asaas_split } : {}),
  externalReference: [refNormal, aff?.external_reference_tag].filter(Boolean).join('|'),
};
const asaas = await criarNoAsaas(payload); // payment, subscription ou parcelamento

// 3) Logo depois, registrar a venda atribuída
if (aff) {
  await supabase.rpc('af_register_charge', {
    p_link_slug: body.affiliateSlug,
    p_product_id: String(body.productId),
    p_customer_email: body.userEmail,
    p_customer_document: body.cpfCnpj,
    p_asaas_customer_id: asaas.customer,
    p_asaas_payment_id: asaas.paymentId ?? null,          // Pix avulso / 1ª parcela
    p_gross_value: asaas.value ?? null,
    p_billing_type: asaas.billingType ?? null,
    p_due_date: asaas.dueDate ?? null,
    p_asaas_subscription_id: asaas.subscriptionId ?? null, // assinatura
    p_asaas_installment_id: asaas.installmentId ?? null,   // cartão parcelado
    p_installment_count: body.parcelas ?? null,
    p_installment_number: asaas.installmentNumber ?? null,
    p_visitor_id: body.visitorId ?? null,
    p_utm: body.utm ?? null,
  });
}
```

`af_checkout_split` devolve `null` se o link não existe ou o afiliado não está ativo. Nesse caso a venda segue normal, sem afiliado.

Em assinatura, pode chamar `af_register_charge` sem `p_asaas_payment_id`: as cobranças entram pelo webhook. Mas a chamada precisa acontecer **logo após criar no Asaas**, porque é ela que liga a assinatura ao afiliado.

### 3.3 Webhook do Asaas

Para todo evento de pagamento:

```js
const { data: r } = await supabase.rpc('af_apply_payment_event', {
  p_event: evt.event,      // ex.: PAYMENT_RECEIVED
  p_payment: evt.payment,  // objeto "payment" do corpo
  p_event_id: evt.id,      // id do evento (idempotência)
});

if (r?.remove_split_from_subscription) {
  // escopo da comissão atingido (ex.: só a 1ª cobrança): tirar o split da assinatura
  await atualizarAssinaturaNoAsaas(r.asaas_subscription_id, { split: [] });
}
```

O que a função faz:
- **Cobrança nova de assinatura/parcelamento já atribuído** (renovação, parcela): cria a comissão se a regra permitir.
- **`PAYMENT_CONFIRMED` / `PAYMENT_RECEIVED`:** comissão vira `confirmed` e recalcula a % sobre o `netValue`.
- **Estorno, chargeback ou cobrança removida:** comissão vira `cancelled`.
- **`split` no payload:** grava o status do split. `DONE` → `paid_out`; `REFUSED` → `refused` (precisa de ação manual).
- **Mesmo evento recebido de novo:** é ignorado.

### 3.4 Suspender ou bloquear afiliado

Mudar `status` para `suspended`/`blocked` impede **vendas novas** pelo link. Assinaturas já criadas continuam com o split no Asaas: se a ideia é cortar as renovações também, o backend precisa remover o split dessas assinaturas.

## 4. Regras de comissão

Prioridade: **regra afiliado + produto** › **padrão do afiliado** (`affiliates.commission_*`) › **padrão do produto** (regra com `affiliate_id` nulo).

- **Tipo:** `percentage` (% da cobrança) ou `fixed` (R$ por venda).
- **Escopo:**
  - `first_payment`: só a primeira venda.
  - `all_payments`: inclui renovações.
  - `first_n_payments`: as N primeiras cobranças.
- **Cartão parcelado** conta como **uma venda só**: todas as parcelas são "1ª cobrança". Comissão fixa é dividida pelo número de parcelas (R$ 100 em 10x = R$ 10 por parcela). Na % cada parcela já leva a sua parte.
- A regra vigente é **copiada para a comissão** no momento da venda. Mudar a % depois não altera vendas antigas.

## 5. Telas

**Afiliado** (logado, vê só o que é dele):
- `af_dashboard()`: cliques (total e 30 dias), vendas, faturamento gerado e comissão por status (prevista, confirmada, recebida, cancelada, recusada).
- `af_my_commissions()`: lista de vendas e comissões, com **e-mail do cliente mascarado** (`f***@gmail.com`).
- `af_monthly_report()`: mês a mês.
- `select` em `affiliate_links` e `affiliate_payouts` (só os dele).
- `af_create_link(slug, campanha)`: links extras, que precisam começar com `{slug}-`.
- `af_update_my_profile(nome, telefone, chave_pix)`: % e status não são editáveis pelo afiliado.
- `af_apply(slug, nome, telefone, documento)`: inscrição; entra como `pending` até o admin aprovar.

**Admin Ensino Plus** (quem está em `affiliate_admins`):
- `af_dashboard()` e `af_monthly_report()` retornam **todos** os afiliados (faturamento e comissões).
- Leitura e escrita direta em `affiliates` (aprovar, suspender, definir %), `affiliate_commission_rules`, `affiliate_links`, `affiliate_commissions` e `affiliate_referrals` (com os dados do cliente).
- `af_close_payout(afiliado, data_fim)`: junta as comissões manuais confirmadas num fechamento.
- `af_mark_payout_paid(fechamento, url_comprovante)`: marca como pago.
- `affiliate_audit_log`: quem alterou o quê (% de comissão, status, carteira).

## 6. Segurança e LGPD

- RLS ligado em todas as tabelas. O afiliado só lê as próprias linhas; o admin lê tudo; a service_role (backend) ignora RLS.
- O afiliado **não lê** `affiliate_referrals` (onde ficam e-mail e documento do cliente). Ele só vê o e-mail mascarado via `af_my_commissions()`.
- Funções de checkout e webhook só executam com a service_role.
- A página pública só acessa `af_resolve_link` (nome do afiliado e produto) e `af_track_click`.

## 7. Confirmar no sandbox do Asaas antes de produção

Escrevi o schema seguindo a documentação de split do Asaas, mas estes pontos mudam valores e precisam ser conferidos no sandbox:

1. **Base do `percentualValue`:** confirmar se incide sobre o valor líquido (após as taxas do Asaas). O schema assume que sim e recalcula a comissão pelo `netValue` quando o pagamento confirma.
2. **Nomes dos status do split** no objeto `payment` do webhook. O schema reconhece `DONE` e `REFUSED`; outros valores ficam gravados em `split_status` sem mudar o status da comissão.
3. **Estorno depois do split repassado:** como o Asaas devolve a parte do afiliado. O schema marca a comissão como `cancelled`, mas o acerto do dinheiro é do lado do Asaas.
4. **Remover o split de uma assinatura existente** (usado no escopo "só a 1ª cobrança"): confirmar o endpoint e se vale para as cobranças já geradas.
5. **Parcelamento:** confirmar que o split informado na criação é aplicado em cada parcela.

## 8. O que vamos fazer do lado da LP

- Página `/calc-machine-connect/p/{slug}`: mostra a página de venda, valida o link (`af_resolve_link`) e registra a visita (`af_track_click`).
- Repassa o slug para `/calc-machine-connect/assinar?afiliado={slug}`.
- O checkout envia `affiliateSlug`, `visitorId` e `utm` no `POST /subscribe`.
- Telas do afiliado e do admin, consumindo as funções da seção 5.

Para isso vamos precisar de vocês:
- A URL do projeto Supabase e a **anon key** (é pública), para chamar `af_resolve_link`/`af_track_click` e as telas logadas. Se preferirem, vocês expõem esses endpoints pela API de vocês.
- O `/subscribe` aceitando `affiliateSlug`.

## 9. Checklist de implantação

1. Rodar `afiliados_schema.sql` (no sandbox/staging primeiro).
2. Cadastrar o primeiro admin: `insert into affiliate_admins (user_id) values ('<uuid>');`
3. Definir a comissão padrão do produto, por exemplo 30% só na primeira venda do Anual:
   ```sql
   insert into affiliate_commission_rules (product_id, commission_type, commission_value, commission_scope)
   values ('7', 'percentage', 30, 'first_payment');
   ```
4. Implementar 3.2 (subscribe) e 3.3 (webhook).
5. Validar os pontos da seção 7 no sandbox do Asaas.
6. Criar um afiliado de teste, fazer uma compra pelo link `/p/{slug}` e conferir comissão e split.

## Já testado

O SQL foi executado num Postgres 17 do Supabase, dentro de uma transação desfeita no final. A simulação cobriu:
- Criação automática do link principal.
- Clique repetido contado uma vez só.
- Split de 30% gerado para o Asaas.
- Assinatura com 1ª cobrança confirmada: comissão recalculada sobre o líquido (30% de R$ 960 = R$ 288) e aviso para remover o split.
- Renovação sem comissão quando o escopo é "só a 1ª".
- Parcelado 10x com comissão fixa de R$ 100 = R$ 10 por parcela.
- Evento de webhook repetido ignorado; estorno cancelando a comissão; venda sem afiliado não afetada.
- Trava do slug.
- Fechamento manual: total certo, não duplica e marca como pago.
- RLS: afiliado vê só os próprios dados, não lê os dados do cliente, recebe e-mail mascarado e não consegue fechar repasse.
