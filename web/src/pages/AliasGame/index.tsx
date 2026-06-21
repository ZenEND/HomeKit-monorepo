import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, RefreshCw01, SkipForward, Stars02 } from '@untitledui/icons';
import { AnimatePresence, motion } from 'motion/react';
import { LoadingIndicator } from '@/components/application/loading-indicator/loading-indicator';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Card, CardContent } from '@/components/base/card/card';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { SelectItem } from '@/components/base/select/select-item';
import { Toggle } from '@/components/base/toggle/toggle';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { formatTimer, useRoundTimer } from '@/hooks/use-round-timer';
import {
  AI_MODEL_CATALOG,
  buildModelHealthList,
  DEFAULT_AI_MODEL,
  fetchModelsHealth,
  generateAliasWords,
  modelStatusColor,
  modelStatusLabel,
  type AiModelId,
  type AliasWord,
  type GenerateTextDifficulty,
  type GenerateTextRequest,
  type ModelHealthItem,
} from '@/lib/ai/alias-api';
import { useAliasSounds, useTimerTicks } from '@/lib/ai/use-alias-sounds';
import { RouteProvider } from '@/providers/route-provider';
import { cx } from '@/utils/cx';

type GameStep = 'select' | 'settings' | 'play';

interface GameSettings {
  count: number;
  roundSeconds: number;
  language: string;
  difficulty: GenerateTextDifficulty;
  model: AiModelId;
  categories: string[];
  soundEnabled: boolean;
}

const defaultSettings: GameSettings = {
  count: 6,
  roundSeconds: 60,
  language: 'Ukrainian',
  difficulty: 'mixed',
  model: DEFAULT_AI_MODEL,
  categories: ['books', 'food', 'travel', 'movies'],
  soundEnabled: true,
};

const difficultyOptions = [
  { id: 'mixed', label: 'Mixed' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

const languageOptions = [
  { id: 'Ukrainian', label: 'Ukrainian' },
  { id: 'English', label: 'English' },
];

function difficultyColor(difficulty: AliasWord['difficulty']) {
  switch (difficulty) {
    case 'easy':
      return 'success';
    case 'medium':
      return 'warning';
    case 'hard':
      return 'error';
  }
}

function buildRequest(settings: GameSettings): GenerateTextRequest {
  return {
    count: settings.count,
    language: settings.language,
    difficulty: settings.difficulty,
    model: settings.model,
    categories: settings.categories.length > 0 ? settings.categories : undefined,
  };
}

function GameShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-secondary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-secondary/20 via-secondary to-secondary"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-20 size-72 rounded-full bg-brand-solid/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 bottom-10 size-64 rounded-full bg-brand-secondary/10 blur-3xl"
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}

function GameSelect({ onSelect }: { onSelect: () => void }) {
  return (
    <GameShell>
      <header className="mb-8 flex flex-col gap-3">
        <FeaturedIcon icon={Stars02} color="brand" theme="gradient" size="lg" />
        <h1 className="text-display-xs font-semibold text-primary">Party Games</h1>
        <p className="text-sm text-tertiary">Pick a game mode. Alias is ready to play.</p>
      </header>

      <div className="flex flex-1 flex-col gap-4">
        <motion.button
          type="button"
          onClick={onSelect}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="group text-left"
        >
          <Card className="overflow-hidden border-brand-secondary/30 bg-primary/90 ring-2 ring-brand-solid/20 transition duration-200 group-hover:shadow-md">
            <CardContent className="flex flex-col gap-4 py-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-primary">Alias</p>
                  <p className="mt-1 text-sm text-tertiary">
                    Explain words to your teammate. Approve correct guesses or skip.
                  </p>
                </div>
                <Badge color="brand" size="sm">
                  Ready
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge color="gray" size="sm">
                  AI words
                </Badge>
                <Badge color="gray" size="sm">
                  2+ players
                </Badge>
                <Badge color="gray" size="sm">
                  Couch mode
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.button>

        <Card className="opacity-60">
          <CardContent className="py-5">
            <p className="text-sm font-medium text-primary">More games coming soon</p>
            <p className="mt-1 text-sm text-tertiary">Crocodile, Quiz, and Hot Takes are on the roadmap.</p>
          </CardContent>
        </Card>
      </div>

      <Button href="/games" color="link-gray" size="md" className="mt-8 self-start" iconLeading={ArrowLeft}>
        Back to games
      </Button>
    </GameShell>
  );
}

function GameSettings({
  settings,
  onChange,
  onBack,
  onStart,
  loading,
  error,
  modelHealth,
  healthLoading,
  healthCached,
  healthError,
  onRefreshHealth,
}: {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onBack: () => void;
  onStart: () => void;
  loading: boolean;
  error: string | null;
  modelHealth: ModelHealthItem[];
  healthLoading: boolean;
  healthCached: boolean;
  healthError: string | null;
  onRefreshHealth: () => void;
}) {
  const [categoriesInput, setCategoriesInput] = useState(settings.categories.join(', '));
  const modelOptions = AI_MODEL_CATALOG.map((model) => {
    const health = modelHealth.find((item) => item.id === model.id);
    const status = health?.status ?? 'unknown';

    return {
      id: model.id,
      label: `${model.providerLabel} · ${model.label}`,
      supportingText: healthLoading && status === 'unknown' ? 'Checking…' : modelStatusLabel(status),
    };
  });
  const selectedModelHealth =
    modelHealth.find((model) => model.id === settings.model) ??
    buildModelHealthList().find((model) => model.id === settings.model);

  const handleCategoriesBlur = () => {
    const categories = categoriesInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    onChange({ ...settings, categories });
  };

  return (
    <GameShell>
      <header className="mb-6 flex flex-col gap-2">
        <Button color="link-gray" size="sm" className="self-start px-0" iconLeading={ArrowLeft} onClick={onBack}>
          Back
        </Button>
        <h1 className="text-display-xs font-semibold text-primary">Game settings</h1>
        <p className="text-sm text-tertiary">Configure words before the round starts.</p>
      </header>

      <Card className="flex-1 bg-primary/90">
        <CardContent className="flex flex-col gap-5 py-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary">Words per batch</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={8}
                value={settings.count}
                onChange={(event) => onChange({ ...settings, count: Number(event.target.value) })}
                className="h-2 w-full cursor-pointer accent-brand-solid"
              />
              <Badge color="brand" size="md" className="min-w-10 justify-center">
                {settings.count}
              </Badge>
            </div>
            <p className="text-xs text-quaternary">Choose between 5 and 8 words per load.</p>
          </div>

          <Select
            label="Language"
            selectedKey={settings.language}
            onSelectionChange={(key) => onChange({ ...settings, language: String(key) })}
            items={languageOptions}
          >
            {(item) => <SelectItem id={item.id} label={item.label} />}
          </Select>

          <Select
            label="Difficulty"
            selectedKey={settings.difficulty}
            onSelectionChange={(key) =>
              onChange({ ...settings, difficulty: key as GenerateTextDifficulty })
            }
            items={difficultyOptions}
          >
            {(item) => <SelectItem id={item.id} label={item.label} />}
          </Select>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-sm font-medium text-secondary">AI model</label>
                <p className="text-xs text-quaternary">
                  {healthLoading
                    ? 'Running a 1-word generation test for each model…'
                    : healthCached
                      ? 'Showing cached status (up to 10 min).'
                      : healthError
                        ? 'Status check failed — you can still start; the API will auto-fallback.'
                        : 'Fresh generation test.'}
                </p>
              </div>
              <Button
                color="link-gray"
                size="sm"
                iconLeading={RefreshCw01}
                onClick={onRefreshHealth}
                isDisabled={healthLoading}
              >
                {healthLoading ? 'Checking…' : 'Recheck now'}
              </Button>
            </div>

            <Select
              selectedKey={settings.model}
              onSelectionChange={(key) => onChange({ ...settings, model: key as AiModelId })}
              items={modelOptions}
            >
              {(item) => <SelectItem id={item.id} label={item.label} supportingText={item.supportingText} />}
            </Select>

            {selectedModelHealth && (
              <div className="flex flex-col gap-2 rounded-lg border border-secondary bg-secondary px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-primary">{selectedModelHealth.label}</p>
                    <p className="text-xs text-tertiary">{selectedModelHealth.providerLabel}</p>
                  </div>
                  <Badge color={modelStatusColor(selectedModelHealth.status)} size="sm">
                    {modelStatusLabel(selectedModelHealth.status)}
                  </Badge>
                </div>
                <p className="text-xs text-tertiary">{selectedModelHealth.description}</p>
                {selectedModelHealth.message && (
                  <p className="text-xs text-quaternary">{selectedModelHealth.message}</p>
                )}
                {healthError && (
                  <p className="text-xs text-quaternary">{healthError}</p>
                )}
                <p className="text-xs text-quaternary">
                  The game auto-falls back to another model if this one is busy.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary">Round timer</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={30}
                max={120}
                step={15}
                value={settings.roundSeconds}
                onChange={(event) => onChange({ ...settings, roundSeconds: Number(event.target.value) })}
                className="h-2 w-full cursor-pointer accent-brand-solid"
              />
              <Badge color="brand" size="md" className="min-w-14 justify-center">
                {formatTimer(settings.roundSeconds)}
              </Badge>
            </div>
            <p className="text-xs text-quaternary">How long each team turn lasts.</p>
          </div>

          <Input
            label="Categories"
            placeholder="books, food, travel, movies"
            value={categoriesInput}
            onChange={(value) => setCategoriesInput(value)}
            onBlur={handleCategoriesBlur}
            hint="Comma-separated. Words will be spread across these categories."
          />

          <Toggle
            isSelected={settings.soundEnabled}
            onChange={(enabled) => onChange({ ...settings, soundEnabled: enabled })}
            label="Game sounds"
            hint="Approve, skip, countdown ticks, and time-up cues."
          />

          {error && (
            <p className="rounded-lg bg-error-primary px-3 py-2 text-sm text-error-primary" role="alert">
              {error}
            </p>
          )}

          <Button
            color="primary"
            size="lg"
            className="mt-2 w-full"
            onClick={onStart}
            isDisabled={loading}
          >
            {loading ? 'Generating words…' : 'Start game'}
          </Button>
        </CardContent>
      </Card>
    </GameShell>
  );
}

function GamePlay({
  settings,
  words,
  currentIndex,
  score,
  skipped,
  secondsLeft,
  isExpired,
  loading,
  prefetching,
  error,
  onApprove,
  onSkip,
  onNewTurn,
  onExit,
}: {
  settings: GameSettings;
  words: AliasWord[];
  currentIndex: number;
  score: number;
  skipped: number;
  secondsLeft: number;
  isExpired: boolean;
  loading: boolean;
  prefetching: boolean;
  error: string | null;
  onApprove: () => void;
  onSkip: () => void;
  onNewTurn: () => void;
  onExit: () => void;
}) {
  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? currentIndex + 1 : 0;
  const timerProgress = settings.roundSeconds > 0 ? secondsLeft / settings.roundSeconds : 0;
  const timerIsUrgent = secondsLeft <= 10 && secondsLeft > 0;

  return (
    <GameShell>
      <header className="mb-4 flex items-center justify-between gap-3">
        <Button color="link-gray" size="sm" className="px-0" iconLeading={ArrowLeft} onClick={onExit}>
          Exit
        </Button>
        <div className="flex items-center gap-2">
          {prefetching && (
            <Badge color="gray" size="sm">
              Loading more…
            </Badge>
          )}
          <Badge color="brand" size="sm">
            {settings.language}
          </Badge>
        </div>
      </header>

      <Card className="mb-4 overflow-hidden bg-primary/90">
        <CardContent className="flex items-center gap-4 py-4">
          <div
            className={cx(
              'relative flex size-16 shrink-0 items-center justify-center rounded-full',
              isExpired ? 'bg-error-primary' : timerIsUrgent ? 'bg-warning-primary' : 'bg-brand-secondary/10',
            )}
            style={{
              background: isExpired
                ? undefined
                : `conic-gradient(var(--color-bg-brand-solid) ${timerProgress * 360}deg, var(--color-bg-tertiary) 0deg)`,
            }}
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-primary">
              <Clock
                className={cx(
                  'size-5',
                  isExpired ? 'text-fg-error-secondary' : timerIsUrgent ? 'text-fg-warning-secondary' : 'text-brand-secondary',
                )}
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-tertiary">Round timer</p>
            <p
              className={cx(
                'text-3xl font-semibold tabular-nums',
                isExpired ? 'text-fg-error-secondary' : timerIsUrgent ? 'text-fg-warning-secondary' : 'text-primary',
              )}
            >
              {formatTimer(secondsLeft)}
            </p>
            <p className="text-xs text-quaternary">
              {isExpired ? 'Time is up for this turn.' : timerIsUrgent ? 'Last 10 seconds!' : 'Explain as many words as you can.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="bg-primary/80">
          <CardContent className="flex flex-col items-center py-4">
            <p className="text-xs text-tertiary">Score</p>
            <p className="text-2xl font-semibold text-brand-secondary">{score}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/80">
          <CardContent className="flex flex-col items-center py-4">
            <p className="text-xs text-tertiary">Skipped</p>
            <p className="text-2xl font-semibold text-primary">{skipped}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/80">
          <CardContent className="flex flex-col items-center py-4">
            <p className="text-xs text-tertiary">Card</p>
            <p className="text-2xl font-semibold text-primary">
              {progress}/{words.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative flex flex-1 flex-col justify-center">
        {loading && !currentWord ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <LoadingIndicator type="line-spinner" size="lg" label="Generating words…" />
          </div>
        ) : currentWord ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentWord.word}-${currentIndex}`}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Card className="overflow-hidden border-brand-secondary/20 bg-primary shadow-lg ring-1 ring-brand-solid/10">
                <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                  <Badge color={difficultyColor(currentWord.difficulty)} size="sm">
                    {currentWord.difficulty}
                  </Badge>
                  <p className="text-display-sm font-semibold tracking-tight text-primary sm:text-display-md">
                    {currentWord.word}
                  </p>
                  {currentWord.hint && (
                    <p className="max-w-sm text-sm text-quaternary">{currentWord.hint}</p>
                  )}
                  <Badge color="gray" size="md">
                    {currentWord.category}
                  </Badge>
                  <p className="max-w-xs text-sm text-tertiary">
                    Explain the word. Tap approve when your teammate guesses it correctly.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-sm text-tertiary">No words left. Start a new round from settings.</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-error-primary px-3 py-2 text-center text-sm text-error-primary" role="alert">
            {error}
          </p>
        )}

        <AnimatePresence>
          {isExpired && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/80 backdrop-blur-sm"
            >
              <Card className="mx-4 w-full max-w-sm border-error-secondary/30 shadow-lg">
                <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
                  <FeaturedIcon icon={Clock} color="error" theme="light" size="md" />
                  <div>
                    <p className="text-lg font-semibold text-primary">Time&apos;s up!</p>
                    <p className="mt-1 text-sm text-tertiary">
                      Score {score} · Skipped {skipped}
                    </p>
                  </div>
                  <Button color="primary" size="lg" className="w-full" onClick={onNewTurn}>
                    Start next turn
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button
          color="secondary"
          size="xl"
          className="w-full"
          iconLeading={SkipForward}
          onClick={onSkip}
          isDisabled={!currentWord || loading || isExpired}
        >
          Skip
        </Button>
        <Button
          color="primary"
          size="xl"
          className="w-full"
          iconLeading={CheckCircle}
          onClick={onApprove}
          isDisabled={!currentWord || loading || isExpired}
        >
          Approve +1
        </Button>
      </div>
    </GameShell>
  );
}

export function AliasGame() {
  const [step, setStep] = useState<GameStep>('select');
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [words, setWords] = useState<AliasWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prefetching, setPrefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelHealth, setModelHealth] = useState<ModelHealthItem[]>(() => buildModelHealthList());
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthCached, setHealthCached] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const prefetchStartedRef = useRef(false);
  const sounds = useAliasSounds(settings.soundEnabled);
  const timer = useRoundTimer({
    durationSeconds: settings.roundSeconds,
    onExpire: sounds.playTimeUp,
  });

  useTimerTicks(timer.secondsLeft, sounds.playTick, settings.soundEnabled && timer.isRunning);

  const loadModelHealth = useCallback(async (forceRefresh = false) => {
    setHealthLoading(true);
    setHealthError(null);

    try {
      const response = await fetchModelsHealth(forceRefresh);
      setModelHealth(response.models);
      setHealthCached(response.cached);
    } catch (err) {
      setHealthError(err instanceof Error ? err.message : 'Failed to check model health.');
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step === 'settings') {
      void loadModelHealth();
    }
  }, [loadModelHealth, step]);

  const fetchWords = useCallback(async (gameSettings: GameSettings) => {
    const response = await generateAliasWords(buildRequest(gameSettings));
    return response.words;
  }, []);

  const prefetchNextBatch = useCallback(async () => {
    if (prefetchStartedRef.current || prefetching) {
      return;
    }

    prefetchStartedRef.current = true;
    setPrefetching(true);
    setError(null);

    try {
      const nextWords = await fetchWords(settings);
      setWords((current) => [...current, ...nextWords]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more words.');
      prefetchStartedRef.current = false;
    } finally {
      setPrefetching(false);
    }
  }, [fetchWords, prefetching, settings]);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    setWords([]);
    setCurrentIndex(0);
    setScore(0);
    setSkipped(0);
    prefetchStartedRef.current = false;

    try {
      const initialWords = await fetchWords(settings);
      setWords(initialWords);
      setStep('play');
      timer.reset(settings.roundSeconds);
      sounds.playStart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate words.');
    } finally {
      setLoading(false);
    }
  };

  const advance = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex === words.length - 1 && !prefetchStartedRef.current) {
      void prefetchNextBatch();
    }

    if (nextIndex >= words.length) {
      if (prefetching) {
        return;
      }

      setCurrentIndex(words.length);
      return;
    }

    setCurrentIndex(nextIndex);
  };

  const handleApprove = () => {
    sounds.playApprove();
    setScore((value) => value + 1);
    advance();
  };

  const handleSkip = () => {
    sounds.playSkip();
    setSkipped((value) => value + 1);
    advance();
  };

  const handleNewTurn = () => {
    timer.reset(settings.roundSeconds);
    sounds.playStart();
  };

  const handleExit = () => {
    timer.pause();
    setStep('select');
    setWords([]);
    setCurrentIndex(0);
    setScore(0);
    setSkipped(0);
    prefetchStartedRef.current = false;
  };

  return (
    <RouteProvider>
      {step === 'select' && <GameSelect onSelect={() => setStep('settings')} />}
      {step === 'settings' && (
        <GameSettings
          settings={settings}
          onChange={setSettings}
          onBack={() => setStep('select')}
          onStart={() => void handleStart()}
          loading={loading}
          error={error}
          modelHealth={modelHealth}
          healthLoading={healthLoading}
          healthCached={healthCached}
          healthError={healthError}
          onRefreshHealth={() => void loadModelHealth(true)}
        />
      )}
      {step === 'play' && (
        <GamePlay
          settings={settings}
          words={words}
          currentIndex={currentIndex}
          score={score}
          skipped={skipped}
          secondsLeft={timer.secondsLeft}
          isExpired={timer.isExpired}
          loading={loading}
          prefetching={prefetching}
          error={error}
          onApprove={handleApprove}
          onSkip={handleSkip}
          onNewTurn={handleNewTurn}
          onExit={handleExit}
        />
      )}
    </RouteProvider>
  );
}
