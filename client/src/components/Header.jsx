import React from 'react';
import './Header.css';

export default function Header({ onNewTask }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-logo"> </span>
          <div>
            <h1 className="header-title">TaskFlow</h1>
            <p className="header-sub">Stay organized, ship faster</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onNewTask}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Task
        </button>
      </div>
    </header>
  );
}
