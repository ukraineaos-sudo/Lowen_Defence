# Löwen Defence® Україна

Next.js (App Router) + вбудована адмінка `/admin` + два Vercel Blob (public media / private data).

## Локальний запуск

1. `npm install`
2. Скопіюй `.env.example` → `.env.local` і заповни:
   - `AUTH_SECRET` — довгий випадковий рядок
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` — через `npm run generate:credentials`
   - `SITE_URL=http://localhost:3000`
3. `npm run dev` → http://localhost:3000  
4. Адмінка: http://localhost:3000/admin

Без Blob-токенів локально працює fallback у `data/` (контент/заявки) і `public/uploads/` (фото).

## Генерація пароля

```bash
npm run generate:credentials
```

Встав вивід у `.env.local` / Vercel Environment Variables. **Не коміть** секрети.

## Vercel Blob (продакшен)

Створи **два** Blob store:

| Store | Токен env | Призначення |
|-------|-----------|-------------|
| Media (public) | `MEDIA_BLOB_READ_WRITE_TOKEN` | фото курсів/команди |
| Data (private) | `DATA_BLOB_READ_WRITE_TOKEN` | `site-content.json`, history, заявки |

Шляхи:

- `content/current/site-content.json`
- `content/history/…` (до 20 версій, rollback = нова current)
- `applications/{yyyy}/{mm}/…`
- `media/courses|team|…`

## Деплой

1. Підключи репо до Vercel (Framework: Next.js)
2. Додай env: `SITE_URL` (прод-домен), `ADMIN_*`, `AUTH_SECRET`, обидва Blob-токени
3. Опційно email заявок (Brevo): `BREVO_API_KEY`, `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM`
4. Deploy → відкрий `/admin` → логін → правки → **Зберегти**

Публічний сайт читає контент server-side з private Blob (fallback на `src/data/default-site-content.ts`).

### Email при заявці (Brevo)

Після успішного збереження заявки сайт шле лист на `NOTIFY_EMAIL_TO`. Якщо ключа немає або Brevo впав — заявка в адмінці все одно є (`console.error` на сервері).

## Скрипти

- `npm run dev` / `build` / `start`
- `npm run lint` — `tsc --noEmit`
- `npm run generate:credentials`

## Приймальні критерії (коротко)

- [ ] `/admin` за логіном, cookie HttpOnly, 12h
- [ ] Збереження контенту без Git/деплою
- [ ] Upload JPEG/PNG/WebP ≤10MB → public media URL у JSON
- [ ] Заявки з форми → private store; адмін list/status/delete
- [ ] History + rollback
- [ ] Секрети лише в env, не в git
- [ ] Admin `noindex`
