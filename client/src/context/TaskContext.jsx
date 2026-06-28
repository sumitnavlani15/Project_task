import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { taskService } from '../utils/api';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

const initialState = {
  tasks: [],
  stats: { todo: 0, 'in-progress': 0, done: 0, total: 0 },
  loading: false,
  statsLoading: false,
  error: null,
  filters: { status: '', priority: '', search: '', sort: '-createdAt' },
  pagination: { total: 0, page: 1, pages: 1 },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STATS_LOADING':
      return { ...state, statsLoading: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload.tasks, pagination: action.payload.pagination, error: null };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t._id === action.payload._id ? action.payload : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t._id !== action.payload) };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchTasks = useCallback(async (overrideFilters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = { ...state.filters, ...overrideFilters };
      // Remove empty params
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const data = await taskService.getAll(params);
      dispatch({ type: 'SET_TASKS', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      toast.error(err.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters]);

  const fetchStats = useCallback(async () => {
    dispatch({ type: 'SET_STATS_LOADING', payload: true });
    try {
      const data = await taskService.getStats();
      dispatch({ type: 'SET_STATS', payload: data });
    } catch (err) {
      // non-critical, don't show error
    } finally {
      dispatch({ type: 'SET_STATS_LOADING', payload: false });
    }
  }, []);

  const createTask = useCallback(async (data) => {
    const task = await taskService.create(data);
    dispatch({ type: 'ADD_TASK', payload: task });
    fetchStats();
    toast.success('Task created!');
    return task;
  }, [fetchStats]);

  const updateTask = useCallback(async (id, data) => {
    const task = await taskService.update(id, data);
    dispatch({ type: 'UPDATE_TASK', payload: task });
    fetchStats();
    toast.success('Task updated!');
    return task;
  }, [fetchStats]);

  const patchTask = useCallback(async (id, data) => {
    const task = await taskService.patch(id, data);
    dispatch({ type: 'UPDATE_TASK', payload: task });
    fetchStats();
    return task;
  }, [fetchStats]);

  const deleteTask = useCallback(async (id) => {
    await taskService.delete(id);
    dispatch({ type: 'DELETE_TASK', payload: id });
    fetchStats();
    toast.success('Task deleted');
  }, [fetchStats]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  return (
    <TaskContext.Provider value={{
      ...state,
      fetchTasks,
      fetchStats,
      createTask,
      updateTask,
      patchTask,
      deleteTask,
      setFilters,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
