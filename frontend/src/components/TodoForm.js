import React, { useState } from 'react';

const PRIORITIES = ['low', 'medium', 'high'];

export default function TodoForm({ onSubmit, initial = {}, onCancel }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    priority: initial.priority || 'medium',
    dueDate: initial.due_date ? initial.due_date.split('T')[0] : ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        dueDate: form.dueDate || null
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save todo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleChange}
          placeholder="What needs to be done?"
          maxLength={255}
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Add details (optional)"
          rows={3}
          maxLength={2000}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : (initial.id ? 'Update Task' : 'Add Task')}
        </button>
      </div>
    </form>
  );
}
