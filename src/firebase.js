/*
 * Firebase bootstrap for phone (SMS) verification.
 *
 * Loaded lazily, on purpose. Firebase Auth is ~115 kB (36 kB gzipped) and this
 * is an ad-traffic landing page, so making every visitor download it — including
 * everyone who only reads the page, and everyone landing on /thank-you — would
 * be a real cost for a feature most of them never touch. The SDK is fetched on
 * the first click of "Send Verification Code" instead. See phoneVerification.js.
 *
 * A NOTE ON "SECRETS": none of these values are secret. Every Firebase web
 * config ships inside the client bundle by definition — anyone can read it in
 * devtools. They live in .env purely so the project isn't hard-coded to one
 * Firebase project. What actually protects the project is configured in the
 * Firebase console, not here:
 *
 *   - Authorised domains  (Authentication → Settings → Authorised domains)
 *   - App Check           (recommended before this takes real traffic)
 *   - SMS region policy   (Authentication → Settings → SMS region policy)
 *
 * Do not treat .env as a security boundary. See FIREBASE_SETUP.md.
 */

const CONFIG_KEYS = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  appId: 'VITE_FIREBASE_APP_ID',
};

function readConfig() {
  return Object.fromEntries(
    Object.entries(CONFIG_KEYS).map(([field, envVar]) => [field, import.meta.env[envVar]]),
  );
}

/**
 * Which config values are missing, if any. Synchronous and dependency-free, so
 * the form can fail with a clear message without pulling in the SDK first.
 */
export function firebaseConfigStatus() {
  const config = readConfig();
  const missing = Object.entries(CONFIG_KEYS)
    .filter(([field]) => !config[field])
    .map(([, envVar]) => envVar);
  return { configured: missing.length === 0, missing };
}

let authPromise = null;

/**
 * Resolves to the Auth instance, downloading the SDK on first call and reusing
 * it afterwards. Also returns the `firebase/auth` module so callers don't have
 * to import it separately and re-trigger a chunk load.
 */
export function loadFirebaseAuth() {
  const { configured, missing } = firebaseConfigStatus();
  if (!configured) {
    return Promise.reject(new Error(`Firebase is not configured. Missing: ${missing.join(', ')}`));
  }
  if (!authPromise) {
    authPromise = (async () => {
      const [{ initializeApp, getApps, getApp }, authModule] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
      ]);
      const app = getApps().length ? getApp() : initializeApp(readConfig());
      return { auth: authModule.getAuth(app), authModule };
    })();
    // A failed load must not be cached, or the next click fails instantly with
    // a stale rejection instead of retrying the download.
    authPromise.catch(() => { authPromise = null; });
  }
  return authPromise;
}
