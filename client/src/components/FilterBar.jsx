import React, { useState, useEffect, useCallback } from 'react';
import { useTasks } from '../context/TaskContext';
import './FilterBar.css';

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

export default function FilterBar() {
  const { filters, setFilters } = useTasks();
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const debouncedSearch = useCallback(
    debounce((val) => setFilters({ search: val }), 350),
    [setFilters]
  );

  useEffect(() => { debouncedSearch(searchInput); }, [searchInput, debouncedSearch]);

  // Sync if filters reset externally
  useEffect(() => { if (!filters.search) setSearchInput(''); }, [filters.search]);

  const clearFilters = () => {
    setFilters({ status: '', priority: '', search: '', sort: '-createdAt' });
    setSearchInput('');
  };

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="filter-bar">
      <div className="filter-search">
        <svg className="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          className="form-input filter-search-input"
          type="text"
          placeholder="Search tasks…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="filter-controls">
        <select
          className="form-select filter-select"
          value={filters.priority}
          onChange={(e) => setFilters({ priority: e.target.value })}
        >
          <option value="">All priorities</option>
          <option value="high"> High</option>
          <option value="medium"> Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className="form-select filter-select"
          value={filters.sort}
          onChange={(e) => setFilters({ sort: e.target.value })}
        >
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="dueDate">Due date ↑</option>
          <option value="-dueDate">Due date ↓</option>
          <option value="title">Title A–Z</option>
          <option value="priority">Priority</option>
        </select>

        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
