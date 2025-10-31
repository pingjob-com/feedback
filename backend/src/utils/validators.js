export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateUsername = (username) => {
  const re = /^[a-zA-Z0-9_-]{3,30}$/;
  return re.test(username);
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000);
};

export const isValidPriority = (priority) => {
  return ['low', 'medium', 'high', 'critical'].includes(priority);
};

export const isValidStatus = (status) => {
  return ['new', 'in_progress', 'resolved'].includes(status);
};

export const isValidCategory = (category) => {
  return ['bug', 'feature', 'improvement', 'other'].includes(category);
};