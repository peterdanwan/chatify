// backend/src/config/passport.ts

import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '#models/User.js';
import { createLogger } from '#config/logger.js';

const log = createLogger(import.meta.url);
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Minimal subset of OAuth profile fields we use across all three providers.
// All three providers extend passport.Profile which guarantees these fields.
interface OAuthProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
}

type ProviderField = 'googleId' | 'facebookId' | 'githubId';

type PassportDone = (err: Error | null, user?: Express.User | false) => void;

/**
 * Find user by provider ID → link to existing email account → create new user.
 *
 * The three-step lookup prevents duplicate accounts when the same email is used
 * across multiple OAuth providers or alongside a local email/password account.
 */
async function findOrCreateUser(field: ProviderField, profile: OAuthProfile) {
  // Step 1: returning user, matched by this provider's unique ID
  const byProvider = await User.findOne({ [field]: profile.id });
  if (byProvider) return byProvider;

  // Step 2: same email already registered (link the provider to that account)
  const email = profile.emails?.[0]?.value;
  if (email) {
    const byEmail = await User.findOne({ email });
    if (byEmail) {
      byEmail.set(field, profile.id);
      return byEmail.save();
    }
  }

  // Step 3: new user — split displayName into firstName / lastName
  const spaceIdx = profile.displayName?.indexOf(' ') ?? -1;
  return User.create({
    [field]: profile.id,
    email: email ?? `${profile.id}@oauth.placeholder`,
    firstName:
      spaceIdx > 0 ? profile.displayName.slice(0, spaceIdx) : profile.displayName || 'User',
    lastName: spaceIdx > 0 ? profile.displayName.slice(spaceIdx + 1) : '',
    profilePic: profile.photos?.[0]?.value ?? '',
  });
}

// Returns the verify callback used by every strategy — same logic, different field name
function makeVerify(field: ProviderField) {
  return async (
    _accessToken: string,
    _refreshToken: string,
    profile: OAuthProfile,
    done: PassportDone
  ) => {
    try {
      done(null, await findOrCreateUser(field, profile));
    } catch (err) {
      log.error(err, `${field} OAuth error`);
      done(err as Error);
    }
  };
}

// ─── Google ───────────────────────────────────────────────────────────────────
// Requires: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET in .env
// Callback registered at: https://console.cloud.google.com → Credentials → OAuth 2.0 Client IDs
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    makeVerify('googleId')
  )
);

// ─── GitHub ───────────────────────────────────────────────────────────────────
// Requires: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET in .env
// Callback registered at: github.com → Settings → Developer settings → OAuth Apps
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${BACKEND_URL}/api/auth/github/callback`,
    },
    makeVerify('githubId')
  )
);

// ─── Facebook ─────────────────────────────────────────────────────────────────
// Requires: FACEBOOK_APP_ID, FACEBOOK_APP_SECRET in .env
// Callback registered at: developers.facebook.com → Your App → Settings → Basic
// profileFields: email is not returned by default, must be explicitly requested
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: `${BACKEND_URL}/api/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    makeVerify('facebookId')
  )
);

export default passport;
