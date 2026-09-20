# Validação rápida — atribuição Ads na LP

Ver checklist completo em `../login/SIGNUP_ATTRIBUTION_TEST.md`.

1. Abrir LP com query completa (`origem` + UTMs + `gclid`).
2. Conferir `localStorage.suiteplus_signup_attribution` e cookie first-party.
3. CTA SuitePlus deve propagar os parâmetros na URL de `/register`.
4. Cadastro via formulário CCT (`signupSuitePlus`) também envia `signup_attribution` no `create-user`.
