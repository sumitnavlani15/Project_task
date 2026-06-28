import { useState, useCallback } from 'react';

const defaultForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  tags: '',
};

const validate = (values) => {
  const errors = {};
  if (!values.title.trim()) {
    errors.title = 'Title is required';
  } else if (values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (values.title.trim().length > 100) {
    errors.title = 'Title cannot exceed 100 characters';
  }
  if (values.description && values.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }
  if (values.dueDate) {
    const due = new Date(values.dueDate);
    if (isNaN(due.getTime())) errors.dueDate = 'Invalid date';
  }
  return errors;
};

export function useTaskForm(initial = null) {
  const [values, setValues] = useState(
    initial
      ? {
          title: initial.title || '',
          description: initial.description || '',
          status: initial.status || 'todo',
          priority: initial.priority || 'medium',
          dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : '',
          tags: (initial.tags || []).join(', '),
        }
      : defaultForm
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    // Clear error on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(values);
    setErrors(errs);
  }, [values]);

  const reset = useCallback(() => {
    setValues(defaultForm);
    setErrors({});
    setTouched({});
  }, []);

  const getPayload = useCallback(() => ({
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    priority: values.priority,
    dueDate: values.dueDate || null,
    tags: values.tags
      ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
  }), [values]);

  const validateAll = useCallback(() => {
    const errs = validate(values);
    setErrors(errs);
    setTouched({ title: true, description: true, dueDate: true });
    return Object.keys(errs).length === 0;
  }, [values]);

  return { values, errors, touched, handleChange, handleBlur, reset, getPayload, validateAll, setValues };
}
