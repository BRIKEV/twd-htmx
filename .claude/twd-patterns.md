# TWD Project Patterns

## Project Configuration

- **Framework**: HTMX 2 (static HTML + Express HTML backend, no bundler, non-Vite)
- **Base path**: /
- **Dev server port**: 3000
- **App URL**: http://localhost:3000
- **Dev command**: npm run dev
- **Default branch**: main
- **Entry point**: public/src/main.js (manual `initTWD` block, only on `localhost`)
- **Public folder**: public (served by `server/server.js`)
- **Closing run**: full suite

`twd-js` is not an npm dependency: `public/index.html` loads it from esm.sh through an
import map (`twd-js`, `twd-js/runner`, `twd-js/bundled`). Tests live in
`public/tests/*.twd.js` and must be registered by hand in the `initTWD({...})` map in
`public/src/main.js`.

Tests run against the REAL Express backend — `serviceWorker: false`, no request
mocking, no `mock-sw.js`. Reset server state in `beforeEach` with
`await fetch('/api/reset', { method: 'POST' })`, and use `findBy*` queries because
HTMX swaps are async.

Note: `--changed-since` only picks up files named `*.twd.test.*`, so it does not see
this repo's `*.twd.js` tests; use `--test` to target specific tests.

### Runner Commands

twd-cli drives its own headless browser — only the dev server has to be up (`npm run dev`).

```bash
# Run all tests
npm run test:ci

# Run specific tests by name (matches "suite > test", case-insensitive; repeatable)
npx twd-cli run --test "loads the seeded todos"

# Record a run to video (one clip per matched test, needs ffmpeg)
npx twd-cli run --record --test "loads the seeded todos"
```

Every run writes `.twd/report/`: `run.json` (the result), `summary.md` and `index.html`. The folder is replaced on each run.

## Standard Imports

```javascript
import { twd, userEvent, screenDom } from 'twd-js';
import { describe, it, beforeEach } from 'twd-js/runner';
// Project-specific imports go here (added by user)
```

## Visit Paths

```javascript
await twd.visit('/');
```

## Standard beforeEach / afterEach

```javascript
beforeEach(async () => {
  await fetch('/api/reset', { method: 'POST' });
});
```

## API Service Types

The backend routes (HTML fragments for HTMX) are in: `server/server.js`, seed data in `server/data.js`.

## Portals and Dialogs

Use `screenDomGlobal` instead of `screenDom` for elements rendered in portals (modals, dropdowns, tooltips):

```javascript
import { screenDomGlobal } from 'twd-js';
const modal = screenDomGlobal.getByRole('dialog');
```
