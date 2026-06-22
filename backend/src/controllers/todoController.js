const TodoModel = require('../models/Todo');

const getAllTodos = async (req, res) => {
  try {
    const { completed, priority } = req.query;
    const todos = await TodoModel.findAllByUser(req.user.id, { completed, priority });
    return res.status(200).json({ todos });
  } catch (err) {
    console.error('GetAllTodos error:', err);
    return res.status(500).json({ error: 'Failed to fetch todos.' });
  }
};

const getTodo = async (req, res) => {
  try {
    const todo = await TodoModel.findById(req.params.id, req.user.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found.' });
    return res.status(200).json({ todo });
  } catch (err) {
    console.error('GetTodo error:', err);
    return res.status(500).json({ error: 'Failed to fetch todo.' });
  }
};

const createTodo = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const todo = await TodoModel.create({
      userId: req.user.id,
      title,
      description,
      priority,
      dueDate
    });
    return res.status(201).json({ message: 'Todo created.', todo });
  } catch (err) {
    console.error('CreateTodo error:', err);
    return res.status(500).json({ error: 'Failed to create todo.' });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { title, description, completed, priority, dueDate } = req.body;
    const todo = await TodoModel.update(req.params.id, req.user.id, {
      title, description, completed, priority, dueDate
    });
    if (!todo) return res.status(404).json({ error: 'Todo not found.' });
    return res.status(200).json({ message: 'Todo updated.', todo });
  } catch (err) {
    console.error('UpdateTodo error:', err);
    return res.status(500).json({ error: 'Failed to update todo.' });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const deleted = await TodoModel.delete(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Todo not found.' });
    return res.status(200).json({ message: 'Todo deleted.' });
  } catch (err) {
    console.error('DeleteTodo error:', err);
    return res.status(500).json({ error: 'Failed to delete todo.' });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await TodoModel.getStats(req.user.id);
    return res.status(200).json({ stats });
  } catch (err) {
    console.error('GetStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};

module.exports = { getAllTodos, getTodo, createTodo, updateTodo, deleteTodo, getStats };
