# Джерела даних про аніме та фільми

HomeKit зберігає всі релізи та метадані в одній таблиці `media_titles`. Жодне джерело не є «головним» — Simkl, Jikan, AniHub, Shikimori і Yani рівноправні провайдери, дані з яких зливаються за правилами пріоритету.

## Архітектура

```
┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│ Simkl       │  │ AniHub      │  │ Jikan/MAL    │  │ AniList     │
│ (календар)  │  │ (seasonal)  │  │ (жанри, EN)  │  │ (GraphQL)   │
└──────┬──────┘  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘
       │                │                 │                   │
       └────────────────┼─────────────────┴───────────────────┘
                        ▼
              ┌──────────────────┐
              │  media_titles    │  ← єдина таблиця
              │  (merged fields) │
              └────────┬─────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
  Списки / рекомендації      GET /plans/calendar/:id
  (ongoing, upcoming)         (розширення + оновлення)
```

### Синхронізація (`POST /plans/calendar/refresh`)

1. **Календарні стрічки** — Simkl anime / TV / movie (або майбутні TMDB, Trakt тощо).
2. **AniHub seasonal** — поточний сезон аніме, upsert за `mal_id` (доповнює Simkl).
3. **Злиття метаданих** — для аніме з MAL ID: Jikan, AniHub, Shikimori, Yani → merged поля в `media_titles`.
4. **Переклад** — AI / MyMemory / Lingva для відсутніх UA назв.

Щоденний cron о 06:00 виконує повний цикл автоматично.

### Деталі тайтлу (`GET /plans/calendar/:id`)

Повертає злиті поля з БД і **оновлює** snapshots з усіх увімкнених джерел. Сторінка тайтлу показує максимум доступної інформації: назви, опис, жанри, рейтинги, статус, епізоди, UA дубляж, зовнішні посилання.

## Джерела

### Simkl

- **Сайт:** https://simkl.com
- **API:** https://simkl.docs.apiary.io
- **Роль:** календар релізів anime / TV / movie — дати, базові назви, постери, рейтинги, зовнішні ID.
- **Налаштування:** `SIMKL_CLIENT_ID` у `api/.env`.

### Jikan (MyAnimeList)

- **API:** https://api.jikan.moe/v4
- **Роль:** англійські назви, жанри за MAL ID.
- **Обмеження:** ~1 запит/секунду.
- **Ключ не потрібен.**

### AniHub

- **API:** https://api.anihub.in.ua
- **Роль:** UA назви, описи, жанри, студії озвучення, `has_ukrainian_dub`, seasonal/popular каталоги.
- **Пошук:** `mal_id`, `anilist_id`, `imdb_id`.
- **Ключ не потрібен.**

### Shikimori

- **GraphQL:** https://shikimori.io/api/graphql
- **Роль:** постери, жанри, рейтинг, RU/EN назви, фандубери/фансабери.
- **Обмеження:** 5 req/s, 90 req/min; обовʼязковий `User-Agent`.
- **Налаштування:** `SHIKIMORI_APP_NAME=homekit`.

### AniList

- **GraphQL:** https://graphql.anilist.co
- **Docs:** https://docs.anilist.co
- **Роль:** EN назви, жанри, описи, рейтинги, обкладинки, статус (RELEASING/FINISHED), наступний епізод (`nextAiringEpisode.airingAt`).
- **Ключ не потрібен.** Ліміт ~90 req/min.
- **Унікальна перевага:** `nextAiringEpisode` зберігається як `nextEpisodeAiringAt` і використовується для щотижневого фільтра — показує аніме що вийде у вибраний тиждень навіть якщо `airDate` є іншим тижнем.

### YummyAnime (Yani.tv)

- **API:** https://api.yani.tv/swagger
- **Роль:** UA назви, описи, жанри, рейтинги (MAL, Shikimori, власний).
- **Мова:** заголовок `Lang: uk`.
- **Налаштування:** опційно `YANI_APP_TOKEN`.

## Пріоритети злиття

| Поле | Джерело (пріоритет) |
|------|---------------------|
| `titleUa` | AniHub → Yani → кеш → Shikimori (RU) |
| `titleEn` | AniHub → AniList → Jikan → Shikimori → Simkl |
| `titleOriginal` | AniHub → AniList (native) → Shikimori → Simkl |
| `genres` | Jikan → AniList → Shikimori → AniHub → Yani |
| `poster` | Shikimori → AniHub → AniList → Yani → Simkl |
| `description` | Yani → AniHub → AniList |
| `ratings.mal` | Jikan → Yani → Simkl |
| `ratings.shikimori` | Shikimori → Yani |
| `ratings.yani` | Yani |
| `ratings.anilist` | AniList (averageScore / 10) |
| `nextEpisodeAiringAt` | AniList (`nextAiringEpisode.airingAt`) |

Злиті значення зберігаються в `media_titles` під час синку. `sourceSnapshots` (JSONB) зберігає сирі відповіді кожного джерела для порівняння на сторінці тайтлу.

## Рекомендації

`GET /plans/recommendations?activity=watching` використовує **злиті рейтинги** (`mergedRatings`: MAL → Shikimori → Yani → Simkl → IMDb) та описи з `media_titles`, а не лише сирі дані Simkl.

## TV і кіно

Календарні стрічки TV/movie поки що з Simkl. Метадані з TMDB/OMDb плануються як окремі провайдери в тій самій таблиці.

## Де дивитися з українською озвучкою

| Сервіс | Опис |
|--------|------|
| [AniHub](https://anihub.in.ua) | Каталог аніме з UA дубляжем |
| [AniTube](https://anitube.in.ua) | Український аніме-портал |
| [YummyAnime](https://yani.tv) | UA каталог і API |
| [Uakino](https://uakino.club) | Фільми та серіали з UA озвучкою |

## Корисні посилання

- [Shikimori GraphQL Playground](https://shikimori.io/api/graphql)
- [AniHub API](https://api.anihub.in.ua/)
- [YummyAnime API](https://api.yani.tv/swagger)
- [Jikan API v4](https://docs.api.jikan.moe/)
- [Simkl API](https://simkl.docs.apiary.io)
- [AniList GraphQL API](https://docs.anilist.co)
