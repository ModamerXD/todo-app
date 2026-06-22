import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTodos, createTodo, updateTodo, deleteTodo, getStats } from '../services/api';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'false' },
  { label: 'Completed', value: 'true' }
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const params = {};
      if (filter !== '') params.completed = filter;
      if (priorityFilter) params.priority = priorityFilter;
      const [todosRes, statsRes] = await Promise.all([getTodos(params), getStats()]);
      setTodos(todosRes.data.todos);
      setStats(statsRes.data.stats);
    } catch {
      setError('Failed to load todos.');
    } finally {
      setLoading(false);
    }
  }, [filter, priorityFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (data) => {
    await createTodo(data);
    setShowForm(false);
    fetchAll();
  };

  const handleUpdate = async (id, data) => {
    await updateTodo(id, data);
    fetchAll();
  };

  const handleDelete = async (id) => {
    await deleteTodo(id);
    fetchAll();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <span className="logo">✓ TaskFlow</span>
        </div>
        <div className="header-right">
          <span className="user-name">👤 {user?.username}</span>
          <button className="btn btn-outline" onClick={logout}>Sign out</button>
        </div>
      </header>

      <main className="dashboard-main">
        {stats && (
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-num">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card stat-card--green">
              <span className="stat-num">{stats.completed}</span>
              <span className="stat-label">Done</span>
            </div>
            <div className="stat-card stat-card--blue">
              <span className="stat-num">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card stat-card--red">
              <span className="stat-num">{stats.high_priority_pending}</span>
              <span className="stat-label">High Priority</span>
            </div>
          </div>
        )}

        <div className="controls">
          <div className="filters">
            {FILTERS.map(f => (
              <button
                key={f.value}
                className={`filter-btn ${filter === f.value ? 'filter-btn--active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
            <select
              className="priority-filter"
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? '✕ Cancel' : '+ New Task'}
          </button>
        </div>

        {showForm && (
          <div className="new-todo-panel">
            <h2>New Task</h2>
            <TodoForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <div className="todo-list">
          {loading ? (
            <div className="empty-state">Loading…</div>
          ) : todos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <p>No tasks yet. Add one above!</p>
            </div>
          ) : (
            todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
