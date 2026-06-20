import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function Home() {
  const { count, health, loading, error, increment, decrement, fetchHealth } =
    useAppStore();

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  return (
    <section>
      <h2>Home Test</h2>
      <p>Welcome to the HomeKit monorepo frontend.</p>

      <div>
        <p>Counter: {count}</p>
        <button type="button" onClick={decrement}>
          -
        </button>
        <button type="button" onClick={increment}>
          +
        </button>
      </div>

      <div>
        <h3>API Health</h3>
        <button type="button" onClick={() => void fetchHealth()} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        {error && <p role="alert">{error}</p>}
        {health && (
          <pre>{JSON.stringify(health, null, 2)}</pre>
        )}
      </div>
    </section>
  );
}
