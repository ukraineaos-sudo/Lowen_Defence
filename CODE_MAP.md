# Карта кода

Публичный лендинг и админка Löwen Defence® Україна (Next.js App Router): курсы самообороны, заявки, CMS-контент в Vercel Blob. Публичный UI — uk/en i18n (cookie `ld_locale`).

## Архитектурный поток

`app/page.tsx` / `app/admin/*` → локаль (`lib/i18n`) + API (`app/api/**`) и серверные сценарии → `lib/**` (auth, content, applications, blob, mail, i18n) → Vercel Blob / `data/` / `public/uploads/` → UI (`components/PublicSite`, `src/components/public|admin`).

## Директории и файлы

### `app/`

Маршруты App Router: публичная главная, админка, API.

| Путь | Назначение |
|---|---|
| `app/layout.tsx` | Корневой layout: шрифт Manrope, metadata, `html lang` из cookie локали, `globals.css`. |
| `app/page.tsx` | SSR читает контент + локаль и рендерит `PublicSite`. |
| `app/globals.css` | Глобальные стили Tailwind/CSS; токены; `.lang-toggle`. |
| `app/admin/_AdminPage.tsx` | Серверная оболочка секций админки: сессия, контент, shell. |
| `app/admin/page.tsx` | Секция dashboard (`/admin`). |
| `app/admin/login/page.tsx` | Страница входа с `AdminLogin`. |
| `app/admin/{courses,team,contacts,applications,history,preview,security}/page.tsx` | Тонкие обёртки секций через `_AdminPage`. |
| `app/api/content/route.ts` | Публичный GET контента сайта. |
| `app/api/applications/route.ts` | Публичный POST заявки (антибот, consent, rate limit). |
| `app/api/auth/login/route.ts` | Логин админа, Set-Cookie сессии. |
| `app/api/auth/logout/route.ts` | Сброс cookie сессии. |
| `app/api/auth/session/route.ts` | Состояние сессии и статус хранилищ. |
| `app/api/admin/content/route.ts` | GET/POST контента с OCC (ETag / expectedRevision). |
| `app/api/admin/history/route.ts` | Список версий контента. |
| `app/api/admin/rollback/route.ts` | Откат версии контента (OCC). |
| `app/api/admin/upload/route.ts` | Загрузка изображений в media store. |
| `app/api/admin/password/route.ts` | Смена пароля админа. |
| `app/api/admin/applications/route.ts` | Список заявок для админки. |
| `app/api/admin/applications/[id]/route.ts` | Мутации заявки по id (статус / удаление). |

### `components/`

| Путь | Назначение |
|---|---|
| `components/PublicSite.tsx` | Клиентская сборка лендинга: `I18nProvider`, resolve CMS по локали, секции, privacy modal. |

### `src/components/public/`

Секции лендинга (тексты через `useI18n` / resolved CMS).

| Путь | Назначение |
|---|---|
| `Header.tsx` | Шапка: навигация, CTA, мобильное меню, UA\|EN toggle. |
| `LanguageToggle.tsx` | Переключатель локали UA\|EN (cookie + `html lang`). |
| `Hero.tsx` | Первый экран лендинга. |
| `TrustStrip.tsx` | Полоса доверия / партнёров. |
| `WhySection.tsx` | Блок «Почему мы». |
| `CoursesSection.tsx` | Каталог курсов с выбором для формы. |
| `MethodSection.tsx` | Методика обучения. |
| `BusinessSection.tsx` | Корпоративные программы. |
| `StandardsSection.tsx` | Стандарты и сертификации. |
| `TeamSection.tsx` | Команда инструкторов. |
| `FaqSection.tsx` | FAQ-аккордеон. |
| `ContactSection.tsx` | Контакты и форма заявки (`POST /api/applications`). |
| `Footer.tsx` | Подвал: контакты, privacy, UA\|EN. |
| `PrivacyModal.tsx` | Модалка политики конфиденциальности (uk/en). |
| `ResponsiveImage.tsx` | Изображение с `object-position` по focal point; alt через `localizedUk`. |

### `src/components/admin/`

UI админки (остаётся украинским; EN-поля CMS не редактируются в UI).

| Путь | Назначение |
|---|---|
| `AdminLogin.tsx` | Форма входа в `/admin`. |
| `AdminShell.tsx` | Оболочка: сессия, сохранение, вкладки, редакторы. |
| `CoursesEditor.tsx` | CRUD курсов (правка uk; en сохраняется через `withLocalizedUk`). |
| `TeamEditor.tsx` | Редактор команды (порядок, фото, описание). |
| `ContactsEditor.tsx` | Редактор контактов. |
| `ApplicationsManager.tsx` | Список заявок, статус, удаление. |
| `HistoryManager.tsx` | История версий и rollback. |
| `DeviceFramePreview.tsx` | Превью сайта в рамках устройств. |
| `PasswordChangeForm.tsx` | Смена пароля админа. |
| `ImageFocalPointPicker.tsx` | Upload JPEG/PNG/WebP и точка обрезки. |
| `ContentMissingPanel.tsx` | Аварийный экран при отсутствии current-контента. |

### `src/data/` и `src/types/`

| Путь | Назначение |
|---|---|
| `src/data/default-site-content.ts` | Bootstrap-контент с dual-shape `{ uk, en }` для курсов/команды. |
| `src/data/privacy-policy.ts` | Политика конфиденциальности uk+en (`getPrivacyPolicy`). |
| `src/types/content.ts` | Типы `SiteContent`, `LocalizedText`, Course, Team, Contacts. |
| `src/types/application.ts` | Типы заявки и статуса `new` / `processed`. |

### `lib/`

Серверная и клиентская доменная логика.

| Путь | Назначение |
|---|---|
| `lib/env.ts` | Runtime-чтение env, токены Media/Data Blob. |
| `lib/api/errors.ts` | Единый error envelope и HTTP-коды API. |
| `lib/admin/admin-fetch.ts` | Клиентский fetch админки (JSON, 401 → login). |
| `lib/auth/password.ts` | scrypt-хеш, проверка пароля, HMAC-подпись. |
| `lib/auth/password-state.ts` | Marker инициализации пароля и pure-policy. |
| `lib/auth/password-store.ts` | Хранение хеша пароля (Blob / local) и marker. |
| `lib/auth/session.ts` | Cookie-сессия админа (Node runtime). |
| `lib/auth/session-edge.ts` | Проверка сессии в Edge (middleware). |
| `lib/auth/csrf.ts` | Same-origin проверка мутирующих запросов. |
| `lib/content/store.ts` | Чтение/запись JSON-контента, history, OCC, rollback. |
| `lib/content/validate.ts` | Zod-валидация `SiteContent` (LocalizedText dual-shape). |
| `lib/content/content-state.ts` | Marker контента и fail-closed матрица bootstrap. |
| `lib/content/content-migration.ts` | Аудит legacy-контента без I/O (trim string/{uk,en}). |
| `lib/content/content-migration-apply.ts` | Apply-safe оркестрация миграции с injectable I/O. |
| `lib/content/paths.ts` | Pathname'ы Blob для current/history. |
| `lib/applications/store.ts` | CRUD заявок в private Blob или `data/applications/`. |
| `lib/applications/form-guards.ts` | Honeypot, consent, timing формы (без I/O). |
| `lib/applications/status.ts` | Runtime-валидация статуса заявки. |
| `lib/blob/media.ts` | Декодирование data:URL и оркестрация upload. |
| `lib/blob/media-storage.ts` | Fail-closed запись медиа в Blob или local uploads. |
| `lib/blob/detect-image-format.ts` | Определение JPEG/PNG/WebP по magic bytes. |
| `lib/mail/notify-application.ts` | Best-effort email о заявке через Brevo. |
| `lib/security/rate-limit.ts` | In-memory rate limit (per-isolate на Vercel). |
| `lib/i18n/locale.ts` | Локали uk\|en, cookie `ld_locale`, parse/fallback. |
| `lib/i18n/localized.ts` | `LocalizedText`, resolve/uk/withUk helpers. |
| `lib/i18n/dictionary.ts` | Статические словари публичного UI uk+en. |
| `lib/i18n/get-request-locale.ts` | Серверное чтение локали из cookie. |
| `lib/i18n/I18nProvider.tsx` | Клиентский контекст локали + словарь. |
| `lib/i18n/resolve-content.ts` | SiteContent → plain strings для публичных секций. |

### `scripts/`, `middleware`, конфиг, хранилище, assets

| Путь | Назначение |
|---|---|
| `middleware.ts` | Защита `/admin` + `?lang=uk\|en` → cookie локали на `/`. |
| `scripts/generate-credentials.ts` | Генерация `ADMIN_PASSWORD_HASH` и `AUTH_SECRET`. |
| `scripts/audit-content-blob.ts` | Dry-run / `--apply-safe` аудит production-контента. |
| `data/` | Локальный fallback: `site-content.json`, history, applications, password hash (dev). |
| `public/` | Статика: `logo/`, `icons/`, `courses/`, `team/`, `method/`, `business/`, `why/`, `uploads/`. |
| `package.json` | npm-скрипты: dev/build/start, test, credentials, audit content. |
| `next.config.ts` | Next.js: remotePatterns для Vercel Blob images. |
| `tsconfig.json` | TypeScript и alias `@/*`. |
| `postcss.config.mjs` | PostCSS / Tailwind. |
| `vitest.config.ts` | Vitest: `Tests/**/*.test.ts`, JSON-отчёт. |
| `.env.example` | Шаблон env: auth, Blob-токены, Brevo, `SITE_URL`. |
| `.github/workflows/ci.yml` | CI: typecheck → tests → build на `main`/PR. |
| `README.md` | Запуск, деплой, Blob, credentials, чеклист. |

## Оркестраторы

| Оркестратор | Координирует | Не должен выполнять |
|---|---|---|
| `components/PublicSite.tsx` | I18nProvider, resolve CMS, секции лендинга, privacy, preselect курса → `#contact` | Хранение контента, API заявки (делает `ContactSection`) |
| `app/admin/_AdminPage.tsx` | Сессию, чтение admin-контента, выбор shell/missing panel | UI-редакторы и CRUD-алгоритмы |
| `src/components/admin/AdminShell.tsx` | Вкладки редакторов, save/load через admin API | Низкоуровневый Blob I/O |
| `lib/blob/media.ts` | Декод data:URL → проверка формата → `storeMediaBuffer` | Политику fail-closed записи (в `media-storage`) |
| `lib/content/content-migration-apply.ts` | Safe-миграцию current через injectable Blob port | Pure-аудит legacy (в `content-migration`) |
| `app/api/applications/route.ts` | Guards → store → notify email | Криптографию auth / CMS-валидацию |
| `middleware.ts` | Admin session guard + форс локали через `?lang=` | Рендер UI / CMS-логику |

## Точки входа

| Путь | Назначение |
|---|---|
| `app/page.tsx` | Публичная главная (SSR). |
| `app/layout.tsx` | HTML-оболочка всех страниц (`lang` из cookie). |
| `middleware.ts` | Edge-guard `/admin/*` и cookie локали на `/`. |
| `app/admin/login/page.tsx` | Вход в админку. |
| `app/admin/**/page.tsx` | Секции админки. |
| `app/api/**/route.ts` | HTTP API публичный и admin. |
| `scripts/generate-credentials.ts` | CLI генерации секретов (`npm run generate:credentials`). |
| `scripts/audit-content-blob.ts` | CLI аудита/миграции контента Blob. |

## Проверки

- Юнит-тесты Vitest в `Tests/*.test.ts`: пароли/HMAC/сессия, password-store, form-guards, rate-limit, validate/content-state/migration/OCC, media-storage, admin-fetch, статусы заявок, i18n/LocalizedText.
- Запуск: `npm test` / `npm run test:watch`; отчёт `Tests/results/vitest-report.json`.
- Описание набора: `Tests/README.md`.
- CI: `.github/workflows/ci.yml` (typecheck, tests, build).
- Дополнительно: `npm run typecheck`, `npm run audit:content`.
