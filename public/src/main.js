// Client-side counter. Re-rendered on navigation (popstate) so twd.visit('/')
// gives each test a fresh "Count is 0" starting point. The todo list, by
// contrast, is fully HTMX-driven against the real backend.
function renderCounter() {
  const button = document.getElementById('counter');
  if (!button) return;
  let count = 0;
  button.textContent = `Count is ${count}`;
  button.onclick = () => {
    count += 1;
    button.textContent = `Count is ${count}`;
  };
}

renderCounter();
window.addEventListener('popstate', renderCounter);

// TWD from the CDN (see the import map in index.html), localhost only.
// serviceWorker is off: this example tests against the real HTML backend rather
// than mocking, so no mock service worker is needed.
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  const { initTWD } = await import('twd-js/bundled');
  initTWD(
    {
      './tests/counter.twd.js': () => import('/tests/counter.twd.js'),
      './tests/todoList.twd.js': () => import('/tests/todoList.twd.js'),
    },
    {
      open: true,
      position: 'left',
      search: true,
      serviceWorker: false,
    },
  );
}
