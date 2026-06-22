import React, { useState } from 'react';
import TodoForm from './TodoForm';

const PRIORITY_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

export default function TodoItem({ todo, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggle = () => onUpdate(todo.id, { completed: !todo.completed });

  const handleEdit = async (data) => {
    await onUpdate(todo.id, data);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      await onDelete(todo.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const dueDate = todo.due_date
    ? new Date(todo.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const isOverdue = todo.due_date && !todo.completed && new Date(todo.due_date) < new Date();

  if (editing) {
    return (
      <div className="todo-item todo-item--editing">
        <TodoForm initial={todo} onSubmit={handleEdit} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className={`todo-item ${todo.completed ? 'todo-item--done' : ''}`}>
      <div className="todo-check">
        <button
          className={`checkbox ${todo.completed ? 'checkbox--checked' : ''}`}
          onClick={handleToggle}
          aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {todo.completed && '✓'}
        </button>
      </div>
      <div className="todo-body">
        <div className="todo-header">
          <span className="todo-title">{todo.title}</span>
          <span
            className="todo-priority"
            style={{ backgroundColor: PRIORITY_COLORS[todo.priority] }}
          >
            {todo.priority}
          </span>
        </div>
        {todo.description && <p className="todo-desc">{todo.description}</p>}
        {dueDate && (
          <span className={`todo-due ${isOverdue ? 'todo-due--overdue' : ''}`}>
            {isOverdue ? '⚠ ' : '📅 '}{dueDate}
          </span>
        )}
      </div>
      <div className="todo-actions">
        <button className="icon-btn" onClick={() => setEditing(true)} title="Edit">✏️</button>
        <button
          className={`icon-btn ${confirmDelete ? 'icon-btn--danger' : ''}`}
          onClick={handleDelete}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}
        >
          {confirmDelete ? '⚠️' : '🗑️'}
        </button>
      </div>
    </div>
  );
}
