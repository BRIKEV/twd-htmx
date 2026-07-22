import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getTodos, addTodo, removeTodo, reset } from './data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.urlencoded({ extended: true }));

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// A single todo, as an HTML fragment. HTMX swaps HTML, not JSON.
const todoItem = (todo) => `
  <li id="todo-${escapeHtml(todo.id)}">
    <h3>${escapeHtml(todo.title)}</h3>
    <p>${escapeHtml(todo.description)}</p>
    <span>Date: ${escapeHtml(todo.date)}</span>
    <button
      hx-delete="/api/todos/${escapeHtml(todo.id)}"
      hx-target="#todo-${escapeHtml(todo.id)}"
      hx-swap="outerHTML"
    >Delete</button>
  </li>`;

// The full list content, swapped into #todo-list (innerHTML).
const todoListHtml = () => {
  const todos = getTodos();
  if (!todos.length) {
    return '<li>No todos yet. Create one above!</li>';
  }
  return todos.map(todoItem).join('');
};

app.get('/api/todos', (_req, res) => {
  res.type('html').send(todoListHtml());
});

app.post('/api/todos', (req, res) => {
  const { title, description, date } = req.body;
  addTodo({ title, description, date });
  res.type('html').send(todoListHtml());
});

app.delete('/api/todos/:id', (req, res) => {
  removeTodo(req.params.id);
  // Empty body + outerHTML swap on the row removes it from the DOM.
  res.type('html').send('');
});

// Dev-only reset so tests get a deterministic starting point.
app.post('/api/reset', (_req, res) => {
  reset();
  res.type('html').send('ok');
});

app.use(express.static(join(__dirname, '..', 'public')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`twd-htmx server running at http://localhost:${port}`);
});
