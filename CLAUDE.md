# Project conventions

## Every backend environment variable must be registered in `backend/src/config/dotEnv.ts`

This file validates all env vars at boot, before anything else runs (see
its own top-of-file comment for the dev/docker-dev/prod `.env` file
strategy). If you add code that reads a new `process.env.SOMETHING`,
**add it to the `ENV_VARS` object in that same commit** — don't just read
`process.env.X` somewhere and assume it'll be caught later.

**Why this matters, concretely**: `BACKEND_URL` was read via
`process.env.BACKEND_URL` in `passport.ts` for months without ever being
registered in `ENV_VARS`. It has a silent fallback to `http://localhost:3000`
in code, so nothing crashed, nothing warned — it just silently misdirected
every OAuth login in production to `localhost`, which was only caught by
noticing a live redirect going somewhere wrong and inspecting the URL by
hand. An unregistered var is invisible until someone stumbles into its
failure mode; a registered one either fails loudly at boot or shows up in
the startup log summary.

**Pattern to follow** (matches every other entry already in that file):

```ts
YOUR_NEW_VAR: {
  required: true, // or a fn: (env) => env.NODE_ENV === 'production', etc.
  description: 'What this is for and which file actually reads it',
  example: 'a-realistic-example-value',
  values: ['optionA', 'optionB'],      // only if it's an enum
  default: 'fallback-value',           // only if a silent default is fine
  validate: (value) => true | 'error message', // only if format matters
},
```

If the variable should be visible in the startup summary (the
`console.log` block at the bottom of `validateEnv()` — currently
Environment/Database/Port/Log Level/Backend URL/Client URL), add a line
there too. Reserve that for values worth eyeballing on every boot, not
everything — most vars don't need it, `ENV_VARS` registration alone is
what matters for catching a missing/malformed value.

Also update whichever `.env*` example/template files are relevant
(`backend/.env`, `.env.docker.development`, `.env.docker.production`) so a
fresh setup doesn't hit the same "works locally, breaks in prod" surprise.
