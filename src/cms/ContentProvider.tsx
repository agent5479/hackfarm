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
import { getBundledHomeContent } from '../content/homeContent';
import { getBundledRidesContent } from '../content/ridesContent';
import {
  getFirebase,
  HOME_CONTENT_PATH,
  isFirebaseConfigured,
  RIDES_CONTENT_PATH,
} from '../lib/firebase';
import {
  getContentPath,
  mergeHomeContent,
  mergeRidesContent,
  setContentPath,
} from './merge';
import type { CmsDoc, HomeContent, RidesContent } from './types';

const bundledHome = getBundledHomeContent();
const bundledRides = getBundledRidesContent();

type CmsContextValue = {
  /** @deprecated use `home` */
  content: HomeContent;
  home: HomeContent;
  rides: RidesContent;
  isEditor: boolean;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveSucceeded: boolean;
  user: User | null;
  firebaseReady: boolean;
  setField: (doc: CmsDoc, path: string, value: string) => void;
  getField: (doc: CmsDoc, path: string) => string;
  save: () => Promise<void>;
  discard: () => void;
  clearSaveSucceeded: () => void;
};

const CmsContext = createContext<CmsContextValue | null>(null);

function markCmsReady() {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.cmsReady = '1';
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const firebaseReady = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [homeBaseline, setHomeBaseline] = useState<HomeContent>(bundledHome);
  const [homeDraft, setHomeDraft] = useState<HomeContent>(bundledHome);
  const [ridesBaseline, setRidesBaseline] = useState<RidesContent>(bundledRides);
  const [ridesDraft, setRidesDraft] = useState<RidesContent>(bundledRides);
  const [isLoading, setIsLoading] = useState(firebaseReady);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);

  const isEditor = user !== null;
  const homeDirty = useMemo(
    () => JSON.stringify(homeDraft) !== JSON.stringify(homeBaseline),
    [homeDraft, homeBaseline],
  );
  const ridesDirty = useMemo(
    () => JSON.stringify(ridesDraft) !== JSON.stringify(ridesBaseline),
    [ridesDraft, ridesBaseline],
  );
  const isDirty = homeDirty || ridesDirty;

  useEffect(() => {
    const fb = getFirebase();
    if (!fb) return;

    return onAuthStateChanged(fb.auth, setUser);
  }, []);

  useEffect(() => {
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
        const [homeSnap, ridesSnap] = await Promise.all([
          get(ref(fb.db, HOME_CONTENT_PATH)),
          get(ref(fb.db, RIDES_CONTENT_PATH)),
        ]);
        if (cancelled) return;
        const home = homeSnap.exists() ? mergeHomeContent(homeSnap.val()) : bundledHome;
        const rides = ridesSnap.exists() ? mergeRidesContent(ridesSnap.val()) : bundledRides;
        setHomeBaseline(home);
        setHomeDraft(home);
        setRidesBaseline(rides);
        setRidesDraft(rides);
      } catch {
        if (!cancelled) {
          setHomeBaseline(bundledHome);
          setHomeDraft(bundledHome);
          setRidesBaseline(bundledRides);
          setRidesDraft(bundledRides);
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

  const setField = useCallback((doc: CmsDoc, path: string, value: string) => {
    if (doc === 'home') {
      setHomeDraft((prev) => setContentPath(prev, path, value));
    } else {
      setRidesDraft((prev) => setContentPath(prev, path, value));
    }
    setSaveError(null);
    setSaveSucceeded(false);
  }, []);

  const getField = useCallback(
    (doc: CmsDoc, path: string) =>
      getContentPath(doc === 'home' ? homeDraft : ridesDraft, path),
    [homeDraft, ridesDraft],
  );

  const discard = useCallback(() => {
    setHomeDraft(homeBaseline);
    setRidesDraft(ridesBaseline);
    setSaveError(null);
    setSaveSucceeded(false);
  }, [homeBaseline, ridesBaseline]);

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
      if (JSON.stringify(homeDraft) !== JSON.stringify(homeBaseline)) {
        writes.push(set(ref(fb.db, HOME_CONTENT_PATH), homeDraft));
      }
      if (JSON.stringify(ridesDraft) !== JSON.stringify(ridesBaseline)) {
        writes.push(set(ref(fb.db, RIDES_CONTENT_PATH), ridesDraft));
      }
      await Promise.all(writes);
      setHomeBaseline(homeDraft);
      setRidesBaseline(ridesDraft);
      setSaveSucceeded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, [homeDraft, homeBaseline, ridesDraft, ridesBaseline, user]);

  const value = useMemo<CmsContextValue>(
    () => ({
      content: homeDraft,
      home: homeDraft,
      rides: ridesDraft,
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
      homeDraft,
      ridesDraft,
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
