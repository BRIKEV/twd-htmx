# twd-htmx

An [HTMX](https://htmx.org/) app tested with [TWD (Test While Developing)](https://github.com/BRIKEV/twd), with **no bundler and no build step**. TWD and HTMX are both loaded straight from a CDN.

HTMX apps are hypermedia-driven: the server returns HTML fragments and HTMX swaps them into the page. This example shows how to test that model in the real browser with TWD, running against a real backend rather than mocking.

## What is in here

- A small **HTMX** todo list: load, create, and delete, each driven by `hx-get` / `hx-post` / `hx-delete` returning HTML fragments.
- A plain client-side **counter** (the "simple button").
- A tiny **Express** server (`server/`) that serves the static files and the HTML API, plus a **dev-only reset endpoint** for deterministic tests.
- In-browser **TWD tests** (`public/tests/*.twd.js`) that run against the real backend.
- **CI** that runs the tests headless with `twd-cli`.

## How TWD and HTMX are installed

No bundler, no `npm install twd-js`. `public/index.html` loads HTMX from a CDN and declares an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) for TWD:

```html
<script src="https://unpkg.com/htmx.org@2.0.10/dist/htmx.min.js"></script>
<script type="importmap">
  {
    "imports": {
      "twd-js": "https://esm.sh/twd-js@1.8.2",
      "twd-js/runner": "https://esm.sh/twd-js@1.8.2/runner",
      "twd-js/bundled": "https://esm.sh/twd-js@1.8.2/bundled"
    }
  }
</script>
```

The TWD service worker intercepts HTMX's requests the same as any `fetch`/XHR, so mocking is available. This example keeps `serviceWorker: false` because it tests against the real backend (see below).

## Why test against a real backend

HTMX expects endpoints to return **HTML**, not JSON. TWD's `twd.mockRequest` serializes mock responses as JSON today, which does not fit HTML fragments, so the clean approach for HTMX is to test against the real HTML-returning backend and reset it between tests. This is the same pattern the [Nuxt example](https://github.com/BRIKEV/twd-nuxt-example) uses.

The Express server exposes a dev-only `POST /api/reset` that restores the seed data. Each test resets in `beforeEach`, so every test starts from a known state:

```js
beforeEach(async () => {
  await fetch('/api/reset', { method: 'POST' });
});
```

Because HTMX swaps are asynchronous and there is no mock request to await, the tests use Testing Library's `findBy*` queries (which wait) instead of `getBy*` (which do not).

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The TWD sidebar appears on the left. Click "Load todos", then run the tests from the sidebar.

Scripts:

- `npm run dev` - Express server with file watching
- `npm run start` - Express server (used in CI)

## CI

`.github/workflows/ci.yml` starts the server and runs the tests headless with the [`twd-cli` GitHub Action](https://github.com/BRIKEV/twd-cli). Contract testing is not used here: contracts validate JSON payloads, and HTMX endpoints return HTML.
