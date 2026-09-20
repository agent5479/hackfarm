import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { get, ref, set } from 'firebase/database';
import { getFirebase, isFirebaseConfigured } from '../lib/firebase';
import { CMS_DOC_IDS, type CmsDocId } from './docs';
import { getContentPath, setContentPath } from './merge';
import { getAllBundledDocs, mergeDoc, rtdbPathForDoc } from './registry';
import { isSeoPrerender } from '../seo/prerender';
import type { HomeContent, RidesContent } from './types';

type DocsMap = Record<CmsDocId, unknown>;

type CmsContextValue = {
  /** @deprecated use getDoc('home') */
  content: HomeContent;
  home: HomeContent;
  rides: RidesContent;
  getDoc: <T = unknown>(id: CmsDocId) => T;
  isEditor: boolean;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveSucceeded: boolean;
  user: User | null;
  firebaseReady: boolean;
  setField: (doc: CmsDocId, path: string, value: string) => void;
  getField: (doc: CmsDocId, path: string) => string;
  save: () => Promise<void>;
  discard: () => void;
  clearSaveSucceeded: () => void;
};

const CmsContext = createContext<CmsContextValue | null>(null);

function markCmsReady() {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.cmsReady = '1';
}

const bundledAll = getAllBundledDocs();

export function ContentProvider({ children }: { children: ReactNode }) {
  const firebaseReady = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [baseline, setBaseline] = useState<DocsMap>(bundledAll);
  const [draft, setDraft] = useState<DocsMap>(bundledAll);
  const [isLoading, setIsLoading] = useState(() => firebaseReady && !isSeoPrerender());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);

  const isEditor = user !== null;
  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline]);

  useEffect(() => {
    const fb = getFirebase();
    if (!fb) return;
    return onAuthStateChanged(fb.auth, setUser);
  }, []);

  useEffect(() => {
    // Playwright prerender: keep bundled defaults only so scrapers see SEO corpus, not live CMS.
    if (isSeoPrerender()) {
      setIsLoading(false);
      markCmsReady();
      return;
    }

    const fb = getFirebase();
    if (!fb) {
      setIsLoading(false);
      markCmsReady();
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    document.documentElement.dataset.cmsReady = '0';

    (async () => {
      try {
        const snaps = await Promise.all(
          CMS_DOC_IDS.map((id) => get(ref(fb.db, rtdbPathForDoc(id)))),
        );
        if (cancelled) return;
        const next = {} as DocsMap;
        CMS_DOC_IDS.forEach((id, i) => {
          const snap = snaps[i]!;
          next[id] = snap.exists() ? mergeDoc(id, snap.val()) : bundledAll[id];
        });
        setBaseline(next);
        setDraft(next);
      } catch {
        if (!cancelled) {
          setBaseline(bundledAll);
          setDraft(bundledAll);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          markCmsReady();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setField = useCallback((doc: CmsDocId, path: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [doc]: setContentPath(prev[doc], path, value),
    }));
    setSaveError(null);
    setSaveSucceeded(false);
  }, []);

  const getField = useCallback(
    (doc: CmsDocId, path: string) => getContentPath(draft[doc], path),
    [draft],
  );

  const getDoc = useCallback(
    <T = unknown>(id: CmsDocId) => draft[id] as T,
    [draft],
  );

  const discard = useCallback(() => {
    setDraft(baseline);
    setSaveError(null);
    setSaveSucceeded(false);
  }, [baseline]);

  const clearSaveSucceeded = useCallback(() => {
    setSaveSucceeded(false);
  }, []);

  const save = useCallback(async () => {
    const fb = getFirebase();
    if (!fb || !user) {
      setSaveError('You must be signed in to save.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSucceeded(false);
    try {
      const writes: Promise<void>[] = [];
      for (const id of CMS_DOC_IDS) {
        if (JSON.stringify(draft[id]) !== JSON.stringify(baseline[id])) {
          writes.push(set(ref(fb.db, rtdbPathForDoc(id)), draft[id]));
        }
      }
      await Promise.all(writes);
      setBaseline(draft);
      setSaveSucceeded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, [draft, baseline, user]);

  const home = draft.home as HomeContent;
  const rides = draft.rides as RidesContent;

  const value = useMemo<CmsContextValue>(
    () => ({
      content: home,
      home,
      rides,
      getDoc,
      isEditor,
      isDirty,
      isLoading,
      isSaving,
      saveError,
      saveSucceeded,
      user,
      firebaseReady,
      setField,
      getField,
      save,
      discard,
      clearSaveSucceeded,
    }),
    [
      home,
      rides,
      getDoc,
      isEditor,
      isDirty,
      isLoading,
      isSaving,
      saveError,
      saveSucceeded,
      user,
      firebaseReady,
      setField,
      getField,
      save,
      discard,
      clearSaveSucceeded,
    ],
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCms must be used within ContentProvider');
  }
  return ctx;
}
