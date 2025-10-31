import { query } from '../config/database.js';
import { asyncHandler, errorResponse, successResponse } from '../utils/errors.js';
import { sanitizeInput } from '../utils/validators.js';

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const offset = (parsedPage - 1) * parsedLimit;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (search) {
    whereClause += ` AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as count FROM users ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].count);

  // Get paginated results
  const result = await query(
    `SELECT id, username, email, full_name, role, is_active, avatar_url, created_at
     FROM users
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT ${parsedLimit} OFFSET ${offset}`,
    params
  );

  successResponse(res, 200, 'Users fetched successfully', {
    data: result.rows,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit)
    }
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return errorResponse(res, 400, 'Invalid role');
  }

  const result = await query(
    `UPDATE users SET role = ? WHERE id = ?`,
    [role, userId]
  );

  if (result.rowCount === 0) {
    return errorResponse(res, 404, 'User not found');
  }

  // Fetch updated user
  const userResult = await query(
    'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
    [userId]
  );

  successResponse(res, 200, 'User role updated successfully', userResult.rows[0]);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const result = await query(
    `UPDATE users SET is_active = ? WHERE id = ?`,
    [isActive, userId]
  );

  if (result.rowCount === 0) {
    return errorResponse(res, 404, 'User not found');
  }

  // Fetch updated user
  const userResult = await query(
    'SELECT id, username, email, is_active, role FROM users WHERE id = ?',
    [userId]
  );

  successResponse(res, 200, 'User status updated successfully', userResult.rows[0]);
});

export const addDeveloperNote = asyncHandler(async (req, res) => {
  const { suggestionId } = req.params;
  const { note } = req.body;
  const adminId = req.user.userId;

  if (!note || note.trim().length === 0) {
    return errorResponse(res, 400, 'Note cannot be empty');
  }

  // Check if suggestion exists
  const suggestionCheck = await query('SELECT id FROM suggestions WHERE id = ?', [suggestionId]);

  if (suggestionCheck.rows.length === 0) {
    return errorResponse(res, 404, 'Suggestion not found');
  }

  const result = await query(
    `INSERT INTO developer_notes (suggestion_id, admin_id, note)
     VALUES (?, ?, ?)`,
    [suggestionId, adminId, sanitizeInput(note)]
  );

  // Fetch created note
  const noteResult = await query(
    'SELECT id, suggestion_id, note, created_at FROM developer_notes WHERE id = ?',
    [result.rows[0].insertId]
  );

  successResponse(res, 201, 'Developer note added successfully', noteResult.rows[0]);
});

export const getDeveloperNotes = asyncHandler(async (req, res) => {
  const { suggestionId } = req.params;

  const result = await query(
    `SELECT dn.id, dn.suggestion_id, dn.note, dn.created_at, dn.updated_at,
            u.id as admin_id, u.username, u.full_name, u.avatar_url
     FROM developer_notes dn
     JOIN users u ON dn.admin_id = u.id
     WHERE dn.suggestion_id = ?
     ORDER BY dn.created_at DESC`,
    [suggestionId]
  );

  successResponse(res, 200, 'Developer notes fetched successfully', result.rows);
});

export const updateDeveloperNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { note } = req.body;
  const adminId = req.user.userId;

  if (!note || note.trim().length === 0) {
    return errorResponse(res, 400, 'Note cannot be empty');
  }

  // Check ownership
  const checkResult = await query('SELECT admin_id FROM developer_notes WHERE id = ?', [noteId]);

  if (checkResult.rows.length === 0) {
    return errorResponse(res, 404, 'Developer note not found');
  }

  if (checkResult.rows[0].admin_id !== adminId && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Cannot update note created by another admin');
  }

  await query(
    `UPDATE developer_notes SET note = ? WHERE id = ?`,
    [sanitizeInput(note), noteId]
  );

  // Fetch updated note
  const noteResult = await query(
    'SELECT * FROM developer_notes WHERE id = ?',
    [noteId]
  );

  successResponse(res, 200, 'Developer note updated successfully', noteResult.rows[0]);
});

export const deleteDeveloperNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const adminId = req.user.userId;

  // Check ownership
  const checkResult = await query('SELECT admin_id FROM developer_notes WHERE id = ?', [noteId]);

  if (checkResult.rows.length === 0) {
    return errorResponse(res, 404, 'Developer note not found');
  }

  if (checkResult.rows[0].admin_id !== adminId && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Cannot delete note created by another admin');
  }

  await query('DELETE FROM developer_notes WHERE id = ?', [noteId]);

  successResponse(res, 200, 'Developer note deleted successfully');
});

export const getAnalytics = asyncHandler(async (req, res) => {
  // Total users
  const totalUsers = await query('SELECT COUNT(*) as count FROM users');

  // Total suggestions
  const totalSuggestions = await query('SELECT COUNT(*) as count FROM suggestions');

  // Suggestions by status
  const suggestionsByStatus = await query(
    `SELECT status, COUNT(*) as count FROM suggestions GROUP BY status`
  );

  // Suggestions by category
  const suggestionsByCategory = await query(
    `SELECT category, COUNT(*) as count FROM suggestions GROUP BY category`
  );

  // Top contributors
  const topContributors = await query(
    `SELECT u.id, u.username, u.full_name, u.avatar_url, COUNT(s.id) as suggestions_count
     FROM users u
     LEFT JOIN suggestions s ON u.id = s.user_id
     WHERE u.role = 'user'
     GROUP BY u.id, u.username, u.full_name, u.avatar_url
     ORDER BY suggestions_count DESC
     LIMIT 10`
  );

  // Suggestions per day (last 30 days)
  const suggestionsPerDay = await query(
    `SELECT DATE(created_at) as date, COUNT(*) as count
     FROM suggestions
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY DATE(created_at)
     ORDER BY date DESC`
  );

  // Latest activity
  const latestActivity = await query(
    `SELECT s.id, s.title, s.status, u.username, u.full_name, s.updated_at
     FROM suggestions s
     JOIN users u ON s.user_id = u.id
     ORDER BY s.updated_at DESC
     LIMIT 10`
  );

  successResponse(res, 200, 'Analytics fetched successfully', {
    totalUsers: totalUsers.rows[0].count,
    totalSuggestions: totalSuggestions.rows[0].count,
    suggestionsByStatus: suggestionsByStatus.rows,
    suggestionsByCategory: suggestionsByCategory.rows,
    topContributors: topContributors.rows,
    suggestionsPerDay: suggestionsPerDay.rows,
    latestActivity: latestActivity.rows
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Prevent deleting admin user
  const userCheck = await query('SELECT role FROM users WHERE id = ?', [userId]);
  if (userCheck.rows.length === 0) {
    return errorResponse(res, 404, 'User not found');
  }

  if (userCheck.rows[0].role === 'admin' && req.user.userId !== userId) {
    return errorResponse(res, 403, 'Cannot delete admin users');
  }

  // Delete user's suggestions first
  await query('DELETE FROM suggestions WHERE user_id = ?', [userId]);
  
  // Delete user
  const result = await query('DELETE FROM users WHERE id = ?', [userId]);

  if (result.rowCount === 0) {
    return errorResponse(res, 404, 'User not found');
  }

  successResponse(res, 200, 'User deleted successfully');
});

export const getAllSuggestions = asyncHandler(async (req, res) => {
  const { status, category, page = 1, limit = 10 } = req.query;
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const offset = (parsedPage - 1) * parsedLimit;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (status) {
    whereClause += ` AND status = ?`;
    params.push(status);
  }

  if (category) {
    whereClause += ` AND category = ?`;
    params.push(category);
  }

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as count FROM suggestions ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].count);

  // Get paginated results
  const result = await query(
    `SELECT s.id, s.title, s.description, s.image_url, s.category, s.priority, s.status,
            u.username, u.full_name as user_name, u.email, u.id as user_id,
            s.created_at, s.updated_at
     FROM suggestions s
     JOIN users u ON s.user_id = u.id
     ${whereClause}
     ORDER BY s.created_at DESC
     LIMIT ${parsedLimit} OFFSET ${offset}`,
    params
  );

  successResponse(res, 200, 'Suggestions fetched successfully', {
    data: result.rows,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit)
    }
  });
});

export const updateSuggestionStatus = asyncHandler(async (req, res) => {
  const { suggestionId } = req.params;
  const { status } = req.body;

  if (!['new', 'in_progress', 'resolved', 'rejected'].includes(status)) {
    return errorResponse(res, 400, 'Invalid status');
  }

  const result = await query(
    `UPDATE suggestions SET status = ? WHERE id = ?`,
    [status, suggestionId]
  );

  if (result.rowCount === 0) {
    return errorResponse(res, 404, 'Suggestion not found');
  }

  // Fetch updated suggestion
  const updatedResult = await query(
    'SELECT * FROM suggestions WHERE id = ?',
    [suggestionId]
  );

  successResponse(res, 200, 'Suggestion status updated successfully', updatedResult.rows[0]);
});

export const deleteSuggestion = asyncHandler(async (req, res) => {
  const { suggestionId } = req.params;

  const result = await query('DELETE FROM suggestions WHERE id = ?', [suggestionId]);

  if (result.rowCount === 0) {
    return errorResponse(res, 404, 'Suggestion not found');
  }

  successResponse(res, 200, 'Suggestion deleted successfully');
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await query('SELECT COUNT(*) as count FROM users');
  const totalSuggestions = await query('SELECT COUNT(*) as count FROM suggestions');
  const newSuggestions = await query('SELECT COUNT(*) as count FROM suggestions WHERE status = "new"');
  const inProgressSuggestions = await query('SELECT COUNT(*) as count FROM suggestions WHERE status = "in_progress"');
  const resolvedSuggestions = await query('SELECT COUNT(*) as count FROM suggestions WHERE status = "resolved"');

  successResponse(res, 200, 'Admin statistics fetched successfully', {
    totalUsers: parseInt(totalUsers.rows[0].count),
    totalSuggestions: parseInt(totalSuggestions.rows[0].count),
    newSuggestions: parseInt(newSuggestions.rows[0].count),
    inProgressSuggestions: parseInt(inProgressSuggestions.rows[0].count),
    resolvedSuggestions: parseInt(resolvedSuggestions.rows[0].count)
  });
});

export const exportSuggestionsCSV = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT s.id, s.title, s.description, s.category, s.priority, s.status,
            u.username, u.email, s.created_at, s.updated_at, s.resolved_at
     FROM suggestions s
     JOIN users u ON s.user_id = u.id
     ORDER BY s.created_at DESC`
  );

  const suggestions = result.rows;

  // Generate CSV
  const headers = ['ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Submitted By', 'Email', 'Created At', 'Updated At', 'Resolved At'];
  const csv = [
    headers.join(','),
    ...suggestions.map(s =>
      [
        s.id,
        `"${s.title.replace(/"/g, '""')}"`,
        `"${s.description.replace(/"/g, '""')}"`,
        s.category,
        s.priority,
        s.status,
        s.username,
        s.email,
        s.created_at,
        s.updated_at,
        s.resolved_at || ''
      ].join(',')
    )
  ].join('\n');

  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="suggestions_export.csv"');
  res.send(csv);
});