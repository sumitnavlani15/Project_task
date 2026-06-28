import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { format, isPast, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import './TaskCard.css';

const STATUS_CYCLE = { todo: 'in-progress', 'in-progress': 'done', done: 'todo' };
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const PRIORITY_DOT = { low: 'low', medium: 'medium', high: 'high'};

export default function TaskCard({ task, onEdit }) {
  const { patchTask, deleteTask } = useTasks();
  const [deleting, setDeleting] = useState(false);
  const [cycling, setCycling] = useState(false);

  const handleStatusCycle = async () => {
    if (cycling) return;
    setCycling(true);
    try {
      const next = STATUS_CYCLE[task.status];
      await patchTask(task._id, { status: next });
      toast.success(`Moved to ${STATUS_LABELS[next]}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCycling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteTask(task._id);
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  const dueDateDisplay = () => {
    if (!task.dueDate) return null;
    const d = new Date(task.dueDate);
    const overdue = isPast(d) && task.status !== 'done';
    const today = isToday(d);
    return (
      <span className={`due-date ${overdue ? 'overdue' : today ? 'today' : ''}`}>
        {overdue ? 'Overdue · ' : today ? ' Today · ' : ' '}
        {format(d, 'MMM d, yyyy')}
      </span>
    );
  };

  return (
    <div className={`task-card priority-${task.priority} ${task.status === 'done' ? 'done' : ''}`}>
      <div className="task-card-left">
        <button
          className={`status-toggle status-${task.status}`}
          onClick={handleStatusCycle}
          disabled={cycling}
          title={`Click to move to ${STATUS_LABELS[STATUS_CYCLE[task.status]]}`}
        >
          {task.status === 'done' ? 'Completed ' : task.status === 'in-progress' ? '' : '○'}
        </button>
      </div>

      <div className="task-card-body">
        <div className="task-card-top">
          <span className="task-title">{task.title}</span>
          <div className="task-badges">
            <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
            <span className={`badge badge-${task.priority}`}>
              {PRIORITY_DOT[task.priority]} {task.priority}
            </span>
          </div>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta">
          {dueDateDisplay()}
          {task.tags?.length > 0 && (
            <div className="task-tags">
              {task.tags.map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          )}
          <span className="task-date">
            Created {format(new Date(task.createdAt), 'MMM d')}
          </span>
        </div>
      </div>

      <div className="task-card-actions">
        <button className="btn-icon" onClick={() => onEdit(task)} title="Edit">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 2.5l2 2L4 12H2v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="btn-icon btn-icon-danger" onClick={handleDelete} disabled={deleting} title="Delete">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5.5 6v4M8.5 6v4M3 4l.7 7.5a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
