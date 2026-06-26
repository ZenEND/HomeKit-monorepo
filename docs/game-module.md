# Game Module — Повний довідник

> `packages/api/src/game/` · `packages/engine/src/games/munchkin/` · `packages/web/src/features/munchkin/`

---

## Зміст

1. [Архітектура модуля](#архітектура)
2. [Можливості гри](#можливості-гри)
3. [Redis: теорія та практика](#redis-теорія-та-практика)
4. [Socket.io події](#socketio-події)
5. [Адмін-панель](#адмін-панель)
6. [Door Events & Кубики](#door-events--кубики)
7. [Запуск локально](#запуск-локально)

---

## Архітектура

```
Browser (React)                   Server (NestJS)                  Redis 7
────────────────────              ─────────────────────────────    ──────────────────────
useGameSocket hook                GameGateway (/game WS)          room:{id}:state  (STRING)
 │                                 │                               room:{id}:info   (STRING)
 ├─ emit GAME_ACTION ────────────► ├─ checkRateLimit (Redis) ───► room:{id}:patches (LIST)
 │                                 ├─ acquireLock   (Redis) ────► room:{id}:lock   (STRING NX)
 │                                 ├─ getRoomState  (Redis)        room:{id}:presence (HASH)
 │                                 ├─ applyMunchkinAction           room:{id}:chat  (LIST)
 │                                 ├─ saveStateAndPatch (pipeline) rooms:active     (SET)
 ◄─ emit STATE_PATCH ─────────────┤ ├─ releaseLock  (Redis)       roomcode:{code}  (STRING)
 │                                 └─ publishEvent  (pub/sub) ──► game:events:{id} (CHANNEL)
 ├─ emit HEARTBEAT ──────────────►    heartbeat() → HASH           rl:{room}:{pid}  (ZSET)
 ◄─ emit PRESENCE_UPDATE ─────────
```

---

## Можливості гри

### Ігровий рушій (`packages/engine`)

| Модуль | Призначення |
|--------|-------------|
| `plugin/types.ts` | Інтерфейс `GamePlugin` — будь-яка гра реалізує його |
| `plugin/registry.ts` | Глобальний реєстр плагінів |
| `games/munchkin/types.ts` | Всі типи: `MunchkinGameState`, `Phase`, `MunchkinCard`, `DiceRollState` тощо |
| `games/munchkin/reducer.ts` | Чиста функція `applyMunchkinAction` — серце гри |
| `games/munchkin/combat.ts` | Обрахунок бою: сила гравця, монстра, втеча |
| `games/munchkin/deck.ts` | Shuffle, drawCard, dealToHand — чисті функції |
| `games/munchkin/seed-data.ts` | 175+ карт + 5 Door Event карт |
| `games/munchkin/plugin.ts` | Реєстрація Munchkin як `GamePlugin` |

### Фази гри

```
WAITING → DOOR_DRAW → COMBAT / DOOR_EVENT → LOOT → CHARITY → TURN_END → (loop)
                    ↘ MINIGAME / PARTY_VOTE / BOSS_RAID / AUCTION ↗
```

### Дії гравця (`MunchkinAction`)

| Тип | Фаза | Опис |
|-----|------|------|
| `KICK_DOOR` | DOOR_DRAW | Витягнути карту з дверної колоди |
| `FIGHT` | COMBAT | Атакувати монстра |
| `FLEE` | COMBAT | Втекти від монстра (кидок кубика d6) |
| `OFFER_HELP` | COMBAT | Запропонувати допомогу іншому гравцю |
| `HINDER` | COMBAT | Зашкодити активному гравцю |
| `LOOT_ROOM` | LOOT | Взяти скарб |
| `EQUIP_ITEM` | будь-яка | Надіти предмет |
| `SELL_ITEM` | LOOT/TURN_END | Продати предмет за золото |
| **`ROLL_DICE`** | **DOOR_EVENT** | **Кинути кубики для Door Event** |
| **`RESOLVE_DOOR_EVENT`** | **DOOR_EVENT** | **Застосувати результат кидку** |
| `END_TURN` | TURN_END/LOOT | Закінчити хід |

---

## Redis: теорія та практика

### Навіщо Redis у грі?

PostgreSQL чудово зберігає постійні дані (картки, акаунти). Але стан активної
гри — це **тимчасовий, дуже часто змінюваний об'єкт**. Щоразу коли гравець
робить дію, стан оновлюється за ~50 мс. Якщо в кімнаті 4 гравці і кожен робить
по 5 дій на хвилину — це 20 записів за 60 секунд. PostgreSQL впорається, але
Redis справляється краще: він in-memory, операції виконуються за < 1 мс, і він
нативно підтримує потрібні структури даних.

---

### Типи даних Redis та де ми їх використовуємо

#### 1. STRING — основне сховище стану і метаданих

```
SET room:{id}:state   "{...JSON...}"  EX 86400
SET room:{id}:info    "{...JSON...}"  EX 86400
SET roomcode:{code}   "room_123_abc"  EX 86400
SET room:{id}:lock    "token_xyz"     PX 300    ← NX (тільки якщо не існує)
```

**STRING** — найпростіший тип. Ми серіалізуємо об'єкти в JSON і зберігаємо
рядком. Завжди встановлюємо TTL (`EX` = секунди, `PX` = мілісекунди), щоб
залишені кімнати автоматично видалялись.

```typescript
// Запис
await redis.setex('room:abc:state', 86400, JSON.stringify(gameState));

// Читання
const raw = await redis.get('room:abc:state');
const state = JSON.parse(raw) as MunchkinGameState;
```

---

#### 2. LIST — журнал JSON-патчів і чат

```
RPUSH room:{id}:patches  "{patch:[...], ts:1234}"   ← додати в кінець
LTRIM room:{id}:patches  -50 -1                     ← зберегти лише останні 50
LRANGE room:{id}:patches -20 -1                     ← отримати останні 20

RPUSH room:{id}:chat     "{text:..., ts:...}"
LTRIM room:{id}:chat     -100 -1
```

**LIST** — впорядкована послідовність рядків. Ми використовуємо її як
кільцевий буфер: додаємо нові записи в кінець (`RPUSH`) і обрізаємо старі
(`LTRIM`). Це ефективніше, ніж зберігати масив всередині STRING, бо `LTRIM`
виконується за O(1).

При реконекті клієнт отримує останні 20 патчів і відновлює актуальний стан,
навіть якщо не бачив кількох оновлень.

```typescript
// Запис патчу
const pipeline = redis.pipeline();
pipeline.rpush(`room:${id}:patches`, JSON.stringify({ patch, ts: Date.now() }));
pipeline.ltrim(`room:${id}:patches`, -50, -1);
pipeline.expire(`room:${id}:patches`, 86400);
await pipeline.exec(); // один TCP-roundtrip замість трьох
```

---

#### 3. HASH — присутність гравців (heartbeat)

```
HSET room:{id}:presence  "player_1"  "1719402000000"
HSET room:{id}:presence  "player_2"  "1719402001500"
HGETALL room:{id}:presence
→ { player_1: "1719402000000", player_2: "1719402001500" }
```

**HASH** — словник поле → значення. Ідеально для присутності: поле = `playerId`,
значення = timestamp останнього heartbeat. Щоб дізнатись хто онлайн — читаємо
весь hash і фільтруємо за порогом (30 секунд).

```typescript
// Heartbeat (клієнт викликає кожні 15 секунд)
await redis.hset(`room:${id}:presence`, playerId, Date.now().toString());
await redis.expire(`room:${id}:presence`, 86400);

// Хто онлайн?
const raw = await redis.hgetall(`room:${id}:presence`);
const online = Object.entries(raw)
  .filter(([, ts]) => Date.now() - parseInt(ts) < 30_000)
  .map(([pid]) => pid);
```

---

#### 4. SET — реєстр активних кімнат

```
SADD rooms:active  "room_abc"
SREM rooms:active  "room_abc"
SMEMBERS rooms:active → ["room_abc", "room_xyz", ...]
```

**SET** — невпорядкована множина унікальних значень. Ми додаємо `roomId` при
створенні кімнати і видаляємо при закритті. `SMEMBERS` повертає всі активні
кімнати для адмін-монітора.

---

#### 5. SORTED SET — rate limiting за ковзним вікном

```
ZADD rl:{room}:{pid}  1719402000100  "1719402000100:rand1"
ZADD rl:{room}:{pid}  1719402000200  "1719402000200:rand2"
ZREMRANGEBYSCORE rl:{room}:{pid} -inf 1719401999100   ← вирізати старі
ZCARD rl:{room}:{pid}  → 2   (скільки дій за останню секунду)
```

**SORTED SET** — множина зі score (числом). Ми використовуємо timestamp як
score: кожна дія гравця додає запис. Команда `ZREMRANGEBYSCORE` видаляє записи
старші за вікно (1 секунда). `ZCARD` рахує скільки дій залишилось у вікні.

> Вся логіка виконується в **Lua-скрипті** атомарно — без race condition між
> перевіркою і записом.

```lua
-- Виконується всередині Redis (atomically)
local count = redis.call('ZCARD', key)
if count >= max_actions then
  return {0, 0}  -- заблоковано
end
redis.call('ZADD', key, now, now .. ':' .. random)
redis.call('PEXPIRE', key, window_ms)
return {1, max_actions - count - 1}  -- дозволено, залишилось N
```

---

#### 6. Pub/Sub — горизонтальне масштабування

```
PUBLISH  game:events:{id}  '{"type":"STATE_PATCH", ...}'
SUBSCRIBE game:events:{id}
```

**Pub/Sub** — механізм повідомлень. Якщо запустити два екземпляри API (за
load balancer), гравці можуть підключитись до різних екземплярів. Коли один
екземпляр обробляє дію, він публікує подію в Redis. Другий екземпляр
підписаний на той самий канал і отримує подію, після чого надсилає її своїм
Socket.io підключенням.

```
API Instance 1                    Redis                  API Instance 2
──────────────────────            ─────────────          ──────────────────────
applyAction()                     Pub/Sub channel        subscribed to room
  → PUBLISH game:events:room ──► game:events:room ────► onMessage → emit to sockets
```

> **Для одного екземпляра Pub/Sub не є критичним** — Socket.io сам транслює
> події. Але при горизонтальному масштабуванні це єдиний правильний підхід.

---

### Distributed Lock — захист від race condition

**Проблема:** два гравці надсилають дію одночасно. Обидва читають однаковий
стан, обидва обчислюють новий стан, і один перезаписує результат іншого.

```
Без локу:
  Player A reads state v1 ──┐
  Player B reads state v1 ──┤
  Player A writes state v2  │ ← based on v1
  Player B writes state v2  ┘ ← also based on v1, overwrites A's result!

З локом:
  Player A: SET lock NX → OK   → reads v1 → writes v2 → DEL lock
  Player B: SET lock NX → FAIL → retry after 20ms → reads v2 → writes v3 → DEL lock
```

**Реалізація через `SET NX PX`:**

```typescript
// Отримати лок
const result = await redis.set(
  `room:${id}:lock`,
  uniqueToken,   // тільки власник може звільнити
  'PX', 300,     // автозвільнення через 300ms (якщо сервер впаде)
  'NX',          // SET only if Not eXists
);
const acquired = result === 'OK';

// Звільнити (Lua — атомарно)
await redis.eval(`
  if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
  end
  return 0
`, 1, lockKey, uniqueToken);
```

---

### Pipeline — пакетні операції

Замість трьох послідовних мережевих запитів — один:

```typescript
// ❌ Три окремі roundtrips
await redis.setex(stateKey, TTL, json);
await redis.rpush(patchesKey, patch);
await redis.sadd('rooms:active', roomId);

// ✅ Один pipeline — один roundtrip
const pipe = redis.pipeline();
pipe.setex(stateKey, TTL, json);
pipe.rpush(patchesKey, patch);
pipe.ltrim(patchesKey, -50, -1);
pipe.expire(patchesKey, TTL);
pipe.sadd('rooms:active', roomId);
await pipe.exec();
```

На практиці це зменшує latency hot-path з ~3 мс до ~1 мс.

---

### Ізоляція сесій

Кожна кімната ізольована через **prefixed ключі**:

```
room:{roomId}:state
room:{roomId}:info
room:{roomId}:patches
room:{roomId}:lock
room:{roomId}:presence
room:{roomId}:chat
```

Щоб переглянути всі ключі кімнати:

```bash
docker exec -it homekit-redis redis-cli KEYS 'room:room_123_*'
```

Коли гра закінчується — всі ключі видаляються pipeline:

```typescript
const pipe = redis.pipeline();
pipe.del(`room:${id}:state`);
pipe.del(`room:${id}:info`);
pipe.del(`room:${id}:patches`);
pipe.del(`room:${id}:presence`);
pipe.del(`room:${id}:chat`);
pipe.srem('rooms:active', id);
await pipe.exec();
```

---

### TTL (Time To Live) — автоочищення

Усі ключі мають TTL = 24 години. Якщо гравці покинули гру і забули закрити
кімнату — Redis сам видалить ключі через добу. Це запобігає накопиченню сміття
без потреби в cron-задачах.

```
room:abc:state  TTL: 86400s (оновлюється при кожному setState)
room:abc:lock   TTL: 300ms  (аварійне автозвільнення)
rl:{room}:{pid} TTL: 1000ms (вікно rate limiter)
```

---

## Socket.io події

### Клієнт → Сервер

| Подія | Payload | Опис |
|-------|---------|------|
| `CREATE_ROOM` | `{ playerId, playerName, pluginId? }` | Створити нову кімнату |
| `JOIN_ROOM` | `{ roomCode, playerId, playerName }` | Приєднатись за кодом |
| `LEAVE_ROOM` | — | Покинути поточну кімнату |
| `START_GAME` | `{ roomId, playerId }` | Почати гру (тільки хост) |
| `GAME_ACTION` | `{ roomId, playerId, action }` | Ігрова дія |
| `RECONNECT` | `{ roomId, playerId }` | Реконект після обриву |
| `HEARTBEAT` | `{ roomId, playerId }` | Підтвердження присутності (кожні 15 с) |
| `CHAT_MESSAGE` | `{ roomId, playerId, playerName, text }` | Повідомлення в чаті |
| `GET_CHAT_HISTORY` | `{ roomId }` | Отримати останні 100 повідомлень |
| `EMOTE` | `{ roomId, playerId, emoteId }` | Емодзі-реакція |

### Сервер → Клієнт

| Подія | Payload | Опис |
|-------|---------|------|
| `ROOM_CREATED` | `{ roomId, roomCode, info }` | Кімната створена |
| `ROOM_JOINED` | `{ roomId, info }` | Успішне приєднання |
| `PLAYER_JOINED` | `{ playerId, playerName, info }` | Новий гравець |
| `PLAYER_LEFT` | `{ playerId }` | Гравець вийшов |
| `PLAYER_DISCONNECTED` | `{ playerId, roomId }` | Обрив підключення |
| `GAME_STARTED` | `{ state }` | Повний початковий стан |
| `STATE_PATCH` | `{ patch[], round, phase }` | JSON-патч після дії |
| `FULL_STATE` | `{ state, recentPatches[] }` | Повний стан (reconnect) |
| `GAME_OVER` | `{ winnerId, finalState }` | Гра завершена |
| `ANIMATION_TRIGGER` | `AnimationTrigger` | Сигнал анімації |
| `PRESENCE_UPDATE` | `{ online: string[] }` | Хто зараз онлайн |
| `CHAT_MESSAGE` | `ChatMessage` | Нове повідомлення |
| `CHAT_HISTORY` | `{ messages[] }` | Історія чату |
| `ERROR` | `{ code, message }` | Помилка |
| `SYSTEM_MESSAGE` | `{ text }` | Адмін-повідомлення |

---

## Адмін-панель

### Навігація

| Шлях | Компонент | Опис |
|------|-----------|------|
| `/admin` | Dashboard | Загальна статистика |
| `/admin/cards` | Card Library | Бібліотека карт Munchkin |
| `/admin/door-events` | DoorEventCreator | Створення Door Event карт |
| `/admin/carry-effects` | CarryEffects | Ефекти між іграми |
| `/admin/games` | GM Approval | Схвалення карт |
| `/admin/monitor` | GameMonitor | Моніторинг активних кімнат |

### Game Monitor (`/admin/monitor`)

- Список всіх активних кімнат (з Redis `rooms:active`)
- Живий стан кожної кімнати (фаза, раунд, гравці)
- Хто онлайн (з Redis `presence` hash)
- Дії: Force End, Kick Player, Inject Card

### REST API для монітора

```
GET  /admin/monitor/rooms          — список активних кімнат
GET  /admin/monitor/rooms/:id      — деталі кімнати
POST /admin/monitor/rooms/:id/end  — примусово завершити гру
POST /admin/monitor/rooms/:id/kick — викинути гравця
POST /admin/monitor/rooms/:id/inject-card — вкинути карту гравцю
```

---

## Door Events & Кубики

### Що таке Door Event?

Door Event — це спеціальна карта в дверній колоді, яка запускає **ситуаційний
сценарій** з кидком 2d6 і різними наслідками залежно від результату.

```
Гравець тягне карту
       ↓
card.subtype === 'door_event'?
       ↓
Переходимо у фазу DOOR_EVENT
       ↓
Показуємо DoorEventOverlay
  • Текст ситуації (narrative)
  • Активний гравець натискає "Roll 2d6"
       ↓
Emit GAME_ACTION { type: 'ROLL_DICE' }
       ↓
Сервер: generateRoll() → знаходить tier → зберігає у diceRollState
       ↓
STATE_PATCH → клієнт анімує кубики (Dice3D) до потрібного числа
       ↓
Показуємо результат + ефекти tier
       ↓
Emit GAME_ACTION { type: 'RESOLVE_DOOR_EVENT' }
       ↓
Сервер застосовує effects[] → продовжуємо гру (LOOT фаза)
```

### Структура DiceRollConfig

```typescript
interface DiceRollConfig {
  diceCount: number;        // 2 для 2d6
  diceType: 'd6';           // d4, d6, d8, d10, d12, d20
  revealBeforeApply: boolean;
  tiers: DiceOutcomeTier[]; // від кращого до гіршого
}

interface DiceOutcomeTier {
  key: 'critical_success' | 'success' | 'partial' | 'fail' | 'critical_fail';
  label: string;            // "🎉 Critical Success (12)"
  minRoll: number;          // 12
  maxRoll: number | null;   // null = немає верхньої межі
  description: string;      // текст що показується гравцям
  effects: DiceOutcomeEffect[];
  animationType: 'celebrate' | 'neutral' | 'curse' | 'death';
}

interface DiceOutcomeEffect {
  type: 'gain_level' | 'lose_level' | 'draw_treasure' | 'lose_gold' | ...;
  amount?: number;
  target: 'active_player' | 'all' | 'left' | 'right';
}
```

### Стандартні пороги для 2d6

| Roll | Результат | Tier |
|------|-----------|------|
| 12 | Максимум | `critical_success` |
| 9–11 | Успіх | `success` |
| 6–8 | Часткова перемога | `partial` |
| 3–5 | Провал | `fail` |
| 2 | Мінімум | `critical_fail` |

### AI-генерація Door Events

```bash
POST /ai/generate-door-event
{
  "seed": "zombie ate your horse",
  "tone": "funny"   // funny | dark | chaotic | dramatic | wholesome
}
```

Відповідь: повний об'єкт з `name`, `description`, `flavorText`, `situationText`
та 5 готовими тірами.

---

## Запуск локально

### Тільки інфраструктура (рекомендовано для розробки)

```bash
# 1. Запустити Postgres + Redis (без API/Web контейнерів)
docker compose up postgres redis -d

# 2. API в режимі watch (NestJS перекомпілює при кожному збереженні)
pnpm dev:api

# 3. Web з HMR (в окремому терміналі)
pnpm dev:web
```

### Налагодження Redis

```bash
# Переглянути всі активні кімнати
docker exec -it homekit-redis redis-cli SMEMBERS rooms:active

# Переглянути стан кімнати
docker exec -it homekit-redis redis-cli GET room:<roomId>:state | python3 -m json.tool

# Переглянути присутність гравців
docker exec -it homekit-redis redis-cli HGETALL room:<roomId>:presence

# Переглянути чат
docker exec -it homekit-redis redis-cli LRANGE room:<roomId>:chat 0 -1

# Переглянути останні патчі
docker exec -it homekit-redis redis-cli LRANGE room:<roomId>:patches -5 -1

# Перевірити лок (якщо є)
docker exec -it homekit-redis redis-cli GET room:<roomId>:lock

# Переглянути всі ключі кімнати
docker exec -it homekit-redis redis-cli KEYS 'room:<roomId>:*'

# Очистити всі дані (не в продакшні!)
docker exec -it homekit-redis redis-cli FLUSHALL
```

### Змінні середовища (packages/api/.env)

```env
REDIS_URL=redis://localhost:6379   # Docker redis
# або
REDIS_URL=redis://:password@host:6379  # з паролем
```

---

## Структура файлів

```
packages/api/src/game/
├── redis.service.ts        ← всі Redis-операції + lock + presence + pub/sub
├── room-manager.service.ts ← логіка кімнат, використовує RedisService
├── game.gateway.ts         ← Socket.io events gateway
├── monitor.controller.ts   ← REST API для адмін-монітора
├── game.module.ts          ← NestJS module
└── utils.ts                ← generateRoomCode, nanoid

packages/engine/src/games/munchkin/
├── types.ts       ← всі типи включно з DiceRollState, DiceRollConfig
├── reducer.ts     ← applyMunchkinAction + applyDiceEffect
├── combat.ts      ← resolveCombat, resolveFlee
├── deck.ts        ← shuffleDeck, drawCard, dealToHand
├── seed-data.ts   ← 175+ карт + 5 Door Event карт
└── plugin.ts      ← MunchkinPlugin implements GamePlugin

packages/web/src/features/munchkin/
├── hooks/
│   ├── useGameSocket.ts    ← Socket.io клієнт
│   └── useGameState.ts     ← Zustand store
└── components/
    ├── Dice3D.tsx           ← CSS 3D кубик з анімацією
    ├── DoorEventOverlay.tsx ← повноекранний оверлей Door Event
    ├── CardComponent.tsx
    ├── CardHand.tsx
    ├── CombatPanel.tsx
    ├── EffectOverlay.tsx    ← tsparticles ефекти
    └── LevelUpCelebration.tsx
```
