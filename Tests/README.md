# Tests

Юніт-тести (Vitest) для критичної логіки: паролі, сесія/`pv`, rate-limit, антибот форми, валідація контенту.

## Запуск

```bash
npm test
```

JSON-звіт: `Tests/results/vitest-report.json`  
Текстовий лог останнього прогону: `Tests/results/last-run.txt`

## Файли

| Файл | Що перевіряє |
|------|----------------|
| `password.test.ts` | hash / verify / HMAC |
| `session.test.ts` | токен + `passwordVersion` |
| `rate-limit.test.ts` | sliding window |
| `form-guards.test.ts` | honeypot / consent / `_t` |
| `validate-content.test.ts` | Zod + safe URLs |
