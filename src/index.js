const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const currentUser = users.find((user) => user.username === username);

  if (!currentUser) {
    return response.status(404).json({ error: "User not found!" });
  }
  request.user = currentUser;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (!username) {
    return response.status(400).json({ error: "Username should be informed!" });
  }

  const usernameAlreadyExist = users.some((user) => user.username === username);

  if (usernameAlreadyExist) {
    return response.status(400).json({ error: "Username already exist!" });
  }

  const newUser = Object.assign({ id: uuidv4(), name, username, todos: [] });
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const todo = Object.assign({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "TODO not found!" });
  }

  if (title) todo.title = title;
  if (deadline) todo.deadline = new Date(deadline);
  todo.updated_at = new Date();

  user.todos.splice(todo, 1);
  user.todos.push(todo);

  return response.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "TODO not found!" });
  }

  todo.done = true;
  todo.updated_at = new Date();

  user.todos.splice(todo, 1);
  user.todos.push(todo);

  return response.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "TODO not found!" });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
