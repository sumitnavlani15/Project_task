import React from 'react';
import { useTasks } from '../context/TaskContext';
import TaskCard from './TaskCard';
import './TaskList.css';

function SkeletonCard() {
  return (
    <div className="task-card skeleton-card">
      <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 14, width: '40%' }} />
    </div>
  );
}

export default function TaskList({ onEdit }) {
  const { tasks, loading, filters, setFilters } = useTasks();

  if (loading) {
    return (
      <div className="task-list">
        {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"> </div>
        <div className="empty-state-title">No tasks found</div>
        <div className="empty-state-desc">
          {filters.search || filters.status || filters.priority
            ? 'Try adjusting your filters'
            : 'Create your first task to get started'}
        </div>
        {(filters.search || filters.status || filters.priority) && (
          <button
            className="btn btn-ghost"
            style={{ marginTop: 16 }}
            onClick={() => setFilters({ status: '', priority: '', search: '' })}
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} onEdit={onEdit} />
      ))}
    </div>
  );
}
