import React, { useEffect, useRef, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTaskForm } from '../hooks/useTaskForm';
import toast from 'react-hot-toast';
import './TaskModal.css';

export default function TaskModal({ task, onClose }) {
  const { createTask, updateTask } = useTasks();
  const { values, errors, touched, handleChange, handleBlur, reset, getPayload, validateAll } = useTaskForm(task);
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef();
  const isEdit = Boolean(task);

  // Focus title on open
  useEffect(() => { titleRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setSubmitting(true);
    try {
      const payload = getPayload();
      if (isEdit) {
        await updateTask(task._id, payload);
      } else {
        await createTask(payload);
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Task' : 'New Task'}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">Title <span className="required">*</span></label>
              <input
                id="title"
                ref={titleRef}
                name="title"
                className={`form-input ${touched.title && errors.title ? 'error' : ''}`}
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="What needs to be done?"
                maxLength={100}
              />
              {touched.title && errors.title && (
                <span className="form-error">⚠ {errors.title}</span>
              )}
              <span className="form-hint">{values.title.length}/100</span>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className={`form-textarea ${touched.description && errors.description ? 'error' : ''}`}
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Add more details…"
                maxLength={500}
              />
              {touched.description && errors.description && (
                <span className="form-error">⚠ {errors.description}</span>
              )}
              <span className="form-hint">{values.description.length}/500</span>
            </div>

            {/* Status + Priority row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="status">Status</label>
                <select id="status" name="status" className="form-select" value={values.status} onChange={handleChange}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="priority">Priority</label>
                <select id="priority" name="priority" className="form-select" value={values.priority} onChange={handleChange}>
                  <option value="low"> Low</option>
                  <option value="medium"> Medium</option>
                  <option value="high"> High</option>
                </select>
              </div>
            </div>

            {/* Due date */}
            <div className="form-group">
              <label className="form-label" htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                className={`form-input ${touched.dueDate && errors.dueDate ? 'error' : ''}`}
                value={values.dueDate}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.dueDate && errors.dueDate && (
                <span className="form-error">⚠ {errors.dueDate}</span>
              )}
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label" htmlFor="tags">Tags</label>
              <input
                id="tags"
                name="tags"
                className="form-input"
                value={values.tags}
                onChange={handleChange}
                placeholder="design, frontend, api  (comma-separated)"
              />
              <span className="form-hint">Separate tags with commas</span>
            </div>
          </div>

          <div className="modal-footer">
            {!isEdit && (
              <button type="button" className="btn btn-ghost" onClick={reset}>
                Reset
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              {isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
