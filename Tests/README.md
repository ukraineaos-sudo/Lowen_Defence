# Tests

Юніт-тести (Vitest) для критичної логіки: паролі, сесія/`pv`, rate-limit, антибот форми, валідація/міграція контенту.

## Запуск

```bash
npm test
```

Локальний JSON-звіт (gitignore, не quality gate): `Tests/results/vitest-report.json`.

На `main` джерело істини — GitHub Actions workflow **CI** (`typecheck` → `test` → `build`) на конкретному SHA.

## Файли

| Файл | Що перевіряє |
|------|----------------|
| `password.test.ts` | hash / verify / HMAC |
| `session.test.ts` | токен + `passwordVersion` |
| `rate-limit.test.ts` | sliding window |
| `form-guards.test.ts` | honeypot / consent / `_t` |
| `validate-content.test.ts` | Zod + safe URLs |
| `content-state.test.ts` | marker × history матриця |
| `content-migration.test.ts` | audit / safe migrate |
| `password-state.test.ts` | password hash × marker |
| `application-status.test.ts` | status Zod |
| `storage-status.test.ts` | Data + Media tokens |
