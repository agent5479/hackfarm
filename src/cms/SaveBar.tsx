import { useEffect } from 'react';
import { useCms } from './ContentProvider';
import './cms.css';

const SAVE_CONFIRM_MS = 4000;

export default function SaveBar() {
  const {
    isEditor,
    isDirty,
    isSaving,
    saveError,
    saveSucceeded,
    save,
    discard,
    clearSaveSucceeded,
  } = useCms();

  useEffect(() => {
    if (!saveSucceeded) return;
    const id = window.setTimeout(() => clearSaveSucceeded(), SAVE_CONFIRM_MS);
    return () => window.clearTimeout(id);
  }, [saveSucceeded, clearSaveSucceeded]);

  if (!isEditor) return null;

  if (saveSucceeded && !isDirty) {
    return (
      <div className="cms-save-bar cms-save-bar--success" role="status" aria-live="polite">
        <p className="cms-save-bar__label">Saved — your changes are live on the site</p>
        <button type="button" className="btn cms-save-bar__btn cms-save-bar__btn--ghost" onClick={clearSaveSucceeded}>
          Dismiss
        </button>
      </div>
    );
  }

  if (!isDirty) {
    return (
      <div className="cms-edit-chip" role="status">
        <span>Editing mode</span>
        <a href="/edit/" className="cms-edit-chip__link">
          Sign out
        </a>
      </div>
    );
  }

  return (
    <div className="cms-save-bar" role="status" aria-live="polite">
      <p className="cms-save-bar__label">Unsaved changes</p>
      {saveError ? <p className="cms-save-bar__error">{saveError}</p> : null}
      <div className="cms-save-bar__actions">
        <button type="button" className="btn cms-save-bar__btn cms-save-bar__btn--ghost" onClick={discard} disabled={isSaving}>
          Discard
        </button>
        <button type="button" className="btn btn--green cms-save-bar__btn" onClick={() => void save()} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
