import { query } from '../config/database.js';
import { hashPassword, comparePasswords } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { validateEmail, validateUsername, validatePassword, sanitizeInput } from '../utils/validators.js';
import { asyncHandler, errorResponse, successResponse } from '../utils/errors.js';

export const signup = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return errorResponse(res, 400, 'Username, email, and password are required');
  }

  if (!validateUsername(username)) {
    return errorResponse(res, 400, 'Invalid username format (3-30 characters, alphanumeric, hyphens, underscores)');
  }

  if (!validateEmail(email)) {
    return errorResponse(res, 400, 'Invalid email format');
  }

  if (!validatePassword(password)) {
    return errorResponse(res, 400, 'Password must be at least 6 characters');
  }

  // Check if user exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = ? OR username = ?',
    [email.toLowerCase(), username.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    return errorResponse(res, 409, 'Email or username already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, role)
     VALUES (?, ?, ?, ?, 'user')`,
    [username.toLowerCase(), email.toLowerCase(), passwordHash, sanitizeInput(fullName || '')]
  );

  // Fetch created user
  const userId = result.insertId || result.rows[0].id;
  const userResult = await query(
    'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?',
    [userId]
  );

  const user = userResult.rows[0];
  const token = generateToken(user.id, user.role);

  successResponse(res, 201, 'Signup successful', {
    user,
    token
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, 'Email and password are required');
  }

  // Find user
  const result = await query(
    'SELECT id, username, email, password_hash, role, is_active, full_name, avatar_url FROM users WHERE email = ?',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  const user = result.rows[0];

  if (!user.is_active) {
    return errorResponse(res, 403, 'Account is inactive');
  }

  // Verify password
  const isPasswordValid = await comparePasswords(password, user.password_hash);

  if (!isPasswordValid) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  const token = generateToken(user.id, user.role);

  const { password_hash, ...userWithoutPassword } = user;

  successResponse(res, 200, 'Login successful', {
    user: userWithoutPassword,
    token
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, username, email, full_name, role, avatar_url, is_active, created_at FROM users WHERE id = ?',
    [req.user.userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 404, 'User not found');
  }

  successResponse(res, 200, 'User fetched successfully', result.rows[0]);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, avatarUrl } = req.body;
  const userId = req.user.userId;

  // Update profile
  await query(
    `UPDATE users 
     SET full_name = IF(? IS NOT NULL, ?, full_name), 
         avatar_url = IF(? IS NOT NULL, ?, avatar_url)
     WHERE id = ?`,
    [sanitizeInput(fullName), sanitizeInput(fullName), avatarUrl, avatarUrl, userId]
  );

  // Fetch updated user
  const result = await query(
    'SELECT id, username, email, full_name, role, avatar_url, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 404, 'User not found');
  }

  successResponse(res, 200, 'Profile updated successfully', result.rows[0]);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;

  if (!oldPassword || !newPassword) {
    return errorResponse(res, 400, 'Old and new passwords are required');
  }

  if (!validatePassword(newPassword)) {
    return errorResponse(res, 400, 'New password must be at least 6 characters');
  }

  // Get current password hash
  const userResult = await query('SELECT password_hash FROM users WHERE id = ?', [userId]);

  if (userResult.rows.length === 0) {
    return errorResponse(res, 404, 'User not found');
  }

  // Verify old password
  const isOldPasswordValid = await comparePasswords(oldPassword, userResult.rows[0].password_hash);

  if (!isOldPasswordValid) {
    return errorResponse(res, 401, 'Old password is incorrect');
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  await query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);

  successResponse(res, 200, 'Password changed successfully');
});