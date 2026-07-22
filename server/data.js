// In-memory store for the example. A dev-only reset endpoint restores this seed
// so each test starts from a known state (the pattern the TWD docs recommend for
// testing against a real backend).

const seed = () => [
  {
    id: '1',
    title: 'Learn TWD',
    description: 'Understand how to use TWD for testing web applications',
    date: '2024-12-20',
  },
  {
    id: '2',
    title: 'Build Todo App',
    description: 'Create a todo list application to demonstrate TWD features',
    date: '2024-12-25',
  },
];

let todos = seed();
let nextId = 3;

export function getTodos() {
  return todos;
}

export function addTodo({ title, description, date }) {
  const todo = { id: String(nextId), title, description, date };
  nextId += 1;
  todos.push(todo);
  return todo;
}

export function removeTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
}

export function reset() {
  todos = seed();
  nextId = 3;
}
