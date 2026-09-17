import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useCms } from '../cms/ContentProvider';
import { CMS_EDIT_LINKS } from '../cms/docs';
import { getFirebase } from '../lib/firebase';
import { usePageMeta } from '../hooks/usePageTitle';
import '../cms/cms.css';

export default function EditPage() {
  usePageMeta({
    title: 'Owner edit',
    description: 'Sign in to edit site content.',
    path: '/edit/',
    robots: 'noindex, nofollow',
  });

  const { user, firebaseReady, isDirty } = useCms();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const fb = getFirebase();
    if (!fb) {
      setError('Firebase is not configured on this build.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(fb.auth, email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  }

  async function onSignOut() {
    const fb = getFirebase();
    if (!fb) return;
    if (isDirty && !window.confirm('You have unsaved changes. Sign out anyway?')) return;
    await signOut(fb.auth);
  }

  return (
    <section className="cms-edit-page">
      <div className="cms-edit-card">
        <h1>Content editing</h1>
        {!firebaseReady ? (
          <p className="cms-edit-card__lead">
            Firebase env vars are not set. Add the <code>VITE_FIREBASE_*</code> values from the Firebase
            Console (see README) and rebuild.
          </p>
        ) : user ? (
          <>
            <p className="cms-edit-status">
              Signed in as <strong>{user.email}</strong>. Open any page below — outlined text is
              editable. Save or discard from the bar at the bottom when you change something.
              {isDirty ? (
                <>
                  {' '}
                  You currently have <strong>unsaved changes</strong>.
                </>
              ) : null}
            </p>
            <ul className="cms-edit-links">
              {CMS_EDIT_LINKS.map((link) => (
                <li key={link.id}>
                  <Link to={link.path} className="btn btn--green">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="cms-edit-form__actions">
              <button type="button" className="btn btn--pink" onClick={() => void onSignOut()}>
                Sign out
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="cms-edit-card__lead">
              Sign in with the owner account to edit marketing copy inline on the live site.
            </p>
            <form className="cms-edit-form" onSubmit={(e) => void onSubmit(e)}>
              <label>
                Email
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              {error ? <p className="cms-edit-form__error">{error}</p> : null}
              <div className="cms-edit-form__actions">
                <button type="submit" className="btn btn--green" disabled={busy}>
                  {busy ? 'Signing in…' : 'Sign in'}
                </button>
                <Link to="/" className="btn btn--blue">
                  Back to site
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
