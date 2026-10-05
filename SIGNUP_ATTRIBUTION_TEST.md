# Validação rápida — atribuição Ads na LP

Ver checklist completo em `../login/SIGNUP_ATTRIBUTION_TEST.md`.

1. Abrir LP com query completa (`origem` + UTMs + `gclid`).
2. Conferir `localStorage.suiteplus_signup_attribution` e cookie first-party.
3. CTA SuitePlus deve propagar os parâmetros na URL de `/register`.
4. Cadastro via formulário CCT (`signupSuitePlus`) também envia `signup_attribution` no `create-user`.


## CCT: redirecionamento com sessao compartilhada

- Publicar a LP em HTTPS sob `ensinoplus.com.br` ou um subdominio.
- Usar nas variaveis `VITE_SUPABASE_*` o mesmo projeto da Suite Integrada.
- Autorizar `https://<dominio-da-lp>/cct/obrigado` em Supabase Auth > URL Configuration > Redirect URLs.
- Com confirmacao de e-mail desativada: cadastrar em `/cct`, verificar passagem por `/cct/obrigado` e redirecionamento automatico para `https://suite.ensinoplus.com.br/?app=cct`, com usuario autenticado.
- Com confirmacao ativada: o Supabase nao emite sessao no cadastro; a pagina aguarda confirmacao. Abrir o link recebido, verificar retorno a `/cct/obrigado` e acesso automatico ao CCT autenticado.
- Conferir cookies `sb-<project-ref>-auth-token` (ou partes `.0`, `.1`, etc.) com Domain `.ensinoplus.com.br`, Path `/`, Secure e SameSite=Lax.
- Testar tambem nome com acentos, sessao maior que 3000 caracteres e logout na suite.
- Localhost usa o armazenamento local padrao e nao compartilha login com a suite de producao.
