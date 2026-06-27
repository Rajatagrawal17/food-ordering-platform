import { securityApi } from '../api/securityApi';
import { storage } from '../utils/storage';

const CSRF_TOKEN_KEY = 'csrfToken';

// Tracks the in-flight (or completed) CSRF bootstrap so anything that needs
// a token can await it instead of racing AuthContext's bootstrap effect.
// Without this, a fast form submission (or a slow/cold-starting backend)
// could fire a CSRF-protected request before the token was ever fetched,
// silently omitting the x-csrf-token header and failing with 403.
let csrfReadyPromise = null;

export const securityService = {
  refreshCsrfToken: () => {
    csrfReadyPromise = (async () => {
      const response = await securityApi.csrfToken();
      storage.set(CSRF_TOKEN_KEY, response.data.csrfToken);
      return response.data.csrfToken;
    })();

    return csrfReadyPromise;
  },
  getCsrfToken: () => storage.get(CSRF_TOKEN_KEY),
  // Resolves once the current (or most recent) refreshCsrfToken() call has
  // settled. If nothing has triggered a refresh yet, falls back to
  // whatever is already in storage (e.g. a value left over from a prior
  // session) so this never hangs forever waiting on nothing.
  whenCsrfReady: () => csrfReadyPromise ?? Promise.resolve(storage.get(CSRF_TOKEN_KEY)),
};
