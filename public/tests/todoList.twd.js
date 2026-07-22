import { twd, userEvent, screenDom } from 'twd-js';
import { describe, it, beforeEach } from 'twd-js/runner';

// These tests run against the REAL backend (no mocking). HTMX swaps HTML
// fragments, so we exercise the actual endpoints and reset the server between
// tests via its dev-only /api/reset endpoint. Because HTMX requests are async,
// we use findBy* queries (which wait) rather than getBy* (which do not).

describe('Todo List (HTMX, real backend)', () => {
  beforeEach(async () => {
    await fetch('/api/reset', { method: 'POST' });
  });

  it('loads the seeded todos', async () => {
    await twd.visit('/');

    const loadButton = await screenDom.getByRole('button', { name: 'Load todos' });
    await userEvent.click(loadButton);

    const todo1 = await screenDom.findByText('Learn TWD');
    twd.should(todo1, 'be.visible');

    const todo2 = await screenDom.findByText('Build Todo App');
    twd.should(todo2, 'be.visible');

    const date1 = await screenDom.findByText('Date: 2024-12-20');
    twd.should(date1, 'be.visible');
  });

  it('creates a todo', async () => {
    await twd.visit('/');

    const titleInput = await screenDom.getByLabelText('Title');
    await userEvent.type(titleInput, 'Write HTMX tests');

    const descriptionInput = await screenDom.getByLabelText('Description');
    await userEvent.type(descriptionInput, 'Cover create and delete');

    const dateInput = await screenDom.getByLabelText('Date');
    await userEvent.type(dateInput, '2026-01-01');

    const submitButton = await screenDom.getByRole('button', { name: 'Create Todo' });
    await userEvent.click(submitButton);

    // The POST returns the full list as HTML; the new item is swapped in.
    const created = await screenDom.findByText('Write HTMX tests');
    twd.should(created, 'be.visible');
  });

  it('deletes a todo', async () => {
    await twd.visit('/');

    const loadButton = await screenDom.getByRole('button', { name: 'Load todos' });
    await userEvent.click(loadButton);

    // Wait for the seeded list, then grab the delete buttons.
    await screenDom.findByText('Learn TWD');
    const deleteButtons = await screenDom.getAllByRole('button', { name: 'Delete' });
    await userEvent.click(deleteButtons[0]);

    // The first todo's row is removed; the second remains.
    await twd.notExists('#todo-1');
    const remaining = await screenDom.findByText('Build Todo App');
    twd.should(remaining, 'be.visible');
  });
});
