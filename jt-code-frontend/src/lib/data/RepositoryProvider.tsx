import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { config } from '@/lib/config';
import { RouteLoading } from '@/app/layouts/RouteLoading';
import type { Repositories } from './contracts';
import { createRepositories } from './factory';
import { runMigrations } from './storage/migrations';
import { seedMockData } from './mock/seed';

const RepositoryContext = createContext<Repositories | null>(null);

export function RepositoryProvider({ children }: PropsWithChildren) {
  const repositories = useMemo(() => createRepositories(), []);
  const [ready, setReady] = useState(config.dataMode !== 'mock');

  useEffect(() => {
    if (config.dataMode !== 'mock') return;
    let active = true;
    void (async () => {
      await runMigrations();
      await seedMockData();
      if (active) setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return <RouteLoading />;

  return <RepositoryContext.Provider value={repositories}>{children}</RepositoryContext.Provider>;
}

export function useRepositories(): Repositories {
  const repositories = useContext(RepositoryContext);
  if (!repositories) throw new Error('useRepositories must be used within RepositoryProvider');
  return repositories;
}

export function useRepository<K extends keyof Repositories>(key: K): Repositories[K] {
  return useRepositories()[key];
}
