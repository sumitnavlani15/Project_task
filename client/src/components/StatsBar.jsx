import React from 'react';
import { useTasks } from '../context/TaskContext';
import './StatsBar.css';

const STATS = [
  { key: 'total', label: 'Total', color: 'accent' },
  { key: 'todo', label: 'To Do', color: 'muted' },
  { key: 'in-progress', label: 'In Progress', color: 'blue' },
  { key: 'done', label: 'Done', color: 'green' },
];

export default function StatsBar() {
  const { stats, statsLoading, setFilters, filters } = useTasks();

  const handleClick = (key) => {
    if (key === 'total') {
      setFilters({ status: '' });
    } else {
      setFilters({ status: filters.status === key ? '' : key });
    }
  };

  return (
    <div className="stats-bar">
      {STATS.map(({ key, label, color }) => (
        <button
          key={key}
          className={`stat-card stat-${color} ${filters.status === key ? 'active' : ''}`}
          onClick={() => handleClick(key)}
        >
          <span className="stat-value">
            {statsLoading ? <span className="skeleton" style={{ width: 24, height: 20, display: 'inline-block' }} /> : stats[key] ?? 0}
          </span>
          <span className="stat-label">{label}</span>
        </button>
      ))}
    </div>
  );
}
