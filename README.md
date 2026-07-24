# Löwen Defence® Україна

Next.js (App Router) + вбудована адмінка `/admin` + два Vercel Blob (public media / private data).

## Локальний запуск

1. `npm install`
2. Скопіюй `.env.example` → `.env.local` і заповни:
   - `AUTH_SECRET` — довгий випадковий рядок
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` — через `npm run generate:credentials -- "ВашПароль"`
   - `SITE_URL=http://localhost:3000`
3. `npm run dev` → http://localhost:3000  
4. Адмінка: http://localhost:3000/admin

Без Blob-токенів локально працює fallback у `data/` (контент/заявки) і `public/uploads/` (фото).

## Генерація пароля

```bash
npm run generate:credentials -- "ВашНадійнийПароль123"
```

Без аргумента пароля скрипт завершиться з помилкою (дефолт `admin` вимкнено).  
Встав вивід у `.env.local` / Vercel Environment Variables. **Не коміть** секрети.

Після **зміни пароля в адмінці** старі сесії інвалідуються (у токені є `pv` — fingerprint хешу).

## Тести

Юніт-тести (Vitest) у папці `Tests/`: паролі/HMAC, сесія+`pv`, rate-limit, антибот форми, валідація контенту.

```bash
npm test
```

Звіт: `Tests/results/vitest-report.json`, короткий лог — `Tests/results/last-run.txt`.  
Деталі: `Tests/README.md`.

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

### Власний домен (NIC.UA → Vercel)

1. Vercel → проєкт → **Domains** (у сайдбарі проєкту, не в Settings → General) → **Add Existing**
2. Вкажи домен, середовище **Production** (для apex+www — за потреби; для одного хоста галку redirect на www можна не ставити)
3. Скопіюй DNS, які покаже Vercel (зазвичай **A** для кореня / **CNAME** для піддомену, інколи **TXT**)
4. У NIC.UA → DNS зона → ті самі записи → дочекайся **Valid Configuration** + SSL

`SITE_URL` після підключення домену онови на прод-URL.

### Email при заявці (Brevo)

Після успішного збереження заявки сайт шле лист на `NOTIFY_EMAIL_TO`. Якщо ключа немає або Brevo впав — заявка в адмінці все одно є (`console.error` на сервері).

## Скрипти

- `npm run dev` / `build` / `start`
- `npm run lint` — `tsc --noEmit`
- `npm test` / `npm run test:watch` — Vitest
- `npm run generate:credentials`

## Приймальні критерії (коротко)

- [ ] `/admin` за логіном, cookie HttpOnly, 12h; зміна пароля гасить старі сесії
- [ ] Збереження контенту без Git/деплою
- [ ] Upload JPEG/PNG/WebP ≤3MB → public media URL у JSON
- [ ] Заявки з форми → private store; адмін list/status/delete; rate limit / consent / `FORM_EXPIRED`
- [ ] History + rollback
- [ ] Секрети лише в env, не в git
- [ ] Admin `noindex`
- [ ] `npm test` зелений
