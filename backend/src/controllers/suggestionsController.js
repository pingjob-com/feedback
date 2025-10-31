import { query } from '../config/database.js';
import { asyncHandler, errorResponse, successResponse } from '../utils/errors.js';
import { sanitizeInput, isValidPriority, isValidStatus, isValidCategory } from '../utils/validators.js';

export const createSuggestion = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;
  const userId = req.user.userId;

  // Get image URL from uploaded file or from body
  let imageUrl = null;
  if (req.file) {
    // If file was uploaded, construct the URL
    imageUrl = `/uploads/${req.file.filename}`;
  }

  // Validate input
  if (!title || !description || !category) {
    return errorResponse(res, 400, 'Title, description, and category are required');
  }

  if (!isValidCategory(category)) {
    return errorResponse(res, 400, 'Invalid category');
  }

  if (priority && !isValidPriority(priority)) {
    return errorResponse(res, 400, 'Invalid priority');
  }

  const result = await query(
    `INSERT INTO suggestions (title, description, image_url, category, priority, user_id, status)
     VALUES (?, ?, ?, ?, ?, ?, 'new')`,
    [
      sanitizeInput(title),
      sanitizeInput(description),
      imageUrl,
      category,
      priority || 'medium',
      userId
    ]
  );

  // Fetch created suggestion
  const suggestionResult = await query(
    'SELECT id, title, description, image_url, category, priority, status, user_id, created_at, updated_at FROM suggestions WHERE id = ?',
    [result.rows[0].insertId]
  );

  const suggestion = suggestionResult.rows[0];

  // Log activity
  await query(
    `INSERT INTO activity_logs (suggestion_id, user_id, action, new_value)
     VALUES (?, ?, 'created', ?)`,
    [suggestion.id, userId, `Suggestion created: ${title}`]
  );

  successResponse(res, 201, 'Suggestion created successfully', suggestion);
});

export const getSuggestions = asyncHandler(async (req, res) => {
  const { status, category, priority, search, page = 1, limit = 10 } = req.query;
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const offset = (parsedPage - 1) * parsedLimit;

  let whereClause = 'WHERE 1=1';
  const params = [];

  // For regular users, only show their own suggestions
  // Admins can see all suggestions
  if (req.user && req.user.role !== 'admin') {
    whereClause += ` AND s.user_id = ?`;
    params.push(req.user.userId);
  }

  if (status && isValidStatus(status)) {
    whereClause += ` AND s.status = ?`;
    params.push(status);
  }

  if (category && isValidCategory(category)) {
    whereClause += ` AND s.category = ?`;
    params.push(category);
  }

  if (priority && isValidPriority(priority)) {
    whereClause += ` AND s.priority = ?`;
    params.push(priority);
  }

  if (search) {
    whereClause += ` AND (s.title LIKE ? OR s.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as count FROM suggestions s ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].count);

  // Get paginated results with user info
  const result = await query(
    `SELECT s.id, s.title, s.description, s.image_url, s.category, s.priority, s.status,
            s.user_id, u.username, u.full_name, u.avatar_url,
            s.created_at, s.updated_at, s.resolved_at,
            (SELECT COUNT(*) FROM developer_notes WHERE suggestion_id = s.id) as notes_count
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

export const getSuggestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT s.id, s.title, s.description, s.image_url, s.category, s.priority, s.status,
            s.user_id, u.username, u.full_name, u.avatar_url,
            s.created_at, s.updated_at, s.resolved_at
     FROM suggestions s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = ?`,
    [id]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, 404, 'Suggestion not found');
  }

  const suggestion = result.rows[0];

  // Get attachments
  const attachmentsResult = await query(
    'SELECT id, file_name, file_path, file_type, file_size, created_at FROM attachments WHERE suggestion_id = ?',
    [id]
  );

  // Get developer notes
  const notesResult = await query(
    `SELECT dn.id, dn.note, dn.created_at, dn.updated_at,
            u.username, u.full_name, u.avatar_url
     FROM developer_notes dn
     JOIN users u ON dn.admin_id = u.id
     WHERE dn.suggestion_id = ?
     ORDER BY dn.created_at DESC`,
    [id]
  );

  successResponse(res, 200, 'Suggestion fetched successfully', {
    ...suggestion,
    attachments: attachmentsResult.rows,
    notes: notesResult.rows
  });
});

export const updateSuggestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, priority } = req.body;
  const userId = req.user.userId;

  // Check ownership
  const checkResult = await query('SELECT user_id FROM suggestions WHERE id = ?', [id]);

  if (checkResult.rows.length === 0) {
    return errorResponse(res, 404, 'Suggestion not found');
  }

  if (checkResult.rows[0].user_id !== userId && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Cannot update suggestion created by another user');
  }

  const updateFields = [];
  const updateParams = [];

  if (title) {
    updateFields.push(`title = ?`);
    updateParams.push(sanitizeInput(title));
  }

  if (description) {
    updateFields.push(`description = ?`);
    updateParams.push(sanitizeInput(description));
  }

  if (category && isValidCategory(category)) {
    updateFields.push(`category = ?`);
    updateParams.push(category);
  }

  if (priority && isValidPriority(priority)) {
    updateFields.push(`priority = ?`);
    updateParams.push(priority);
  }

  // Handle uploaded image file
  if (req.file) {
    const imageUrl = `/uploads/${req.file.filename}`;
    updateFields.push(`image_url = ?`);
    updateParams.push(imageUrl);
  }

  if (updateFields.length === 0) {
    return errorResponse(res, 400, 'No valid fields to update');
  }

  updateParams.push(id);

  const result = await query(
    `UPDATE suggestions SET ${updateFields.join(', ')} WHERE id = ?`,
    updateParams
  );

  // Fetch updated suggestion
  const updatedResult = await query(
    `SELECT id, title, description, image_url, category, priority, status, user_id, created_at, updated_at FROM suggestions WHERE id = ?`,
    [id]
  );

  successResponse(res, 200, 'Suggestion updated successfully', updatedResult.rows[0]);
});

export const deleteSuggestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  // Check ownership
  const checkResult = await query('SELECT user_id FROM suggestions WHERE id = ?', [id]);

  if (checkResult.rows.length === 0) {
    return errorResponse(res, 404, 'Suggestion not found');
  }

  if (checkResult.rows[0].user_id !== userId && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Cannot delete suggestion created by another user');
  }

  await query('DELETE FROM suggestions WHERE id = ?', [id]);

  successResponse(res, 200, 'Suggestion deleted successfully');
});

export const updateSuggestionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidStatus(status)) {
    return errorResponse(res, 400, 'Invalid status');
  }

  // Only admins can change status
  if (req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Only admins can change status');
  }

  const resolvedAt = status === 'resolved' ? new Date() : null;

  const result = await query(
    `UPDATE suggestions SET status = ?, resolved_at = ? WHERE id = ?`,
    [status, resolvedAt, id]
  );

  if (result.rowCount === 0) {
    return errorResponse(res, 404, 'Suggestion not found');
  }

  // Fetch updated suggestion
  const updatedResult = await query(
    'SELECT id, title, description, category, priority, status, user_id, created_at, updated_at FROM suggestions WHERE id = ?',
    [id]
  );

  // Log activity
  await query(
    `INSERT INTO activity_logs (suggestion_id, user_id, action, new_value)
     VALUES (?, ?, 'status_changed', ?)`,
    [id, req.user.userId, status]
  );

  successResponse(res, 200, 'Status updated successfully', updatedResult.rows[0]);
});

export const getSuggestionStats = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const statsByStatus = await query(
    `SELECT status, COUNT(*) as count FROM suggestions WHERE user_id = ? GROUP BY status`,
    [userId]
  );

  const statsByCategory = await query(
    `SELECT category, COUNT(*) as count FROM suggestions WHERE user_id = ? GROUP BY category`,
    [userId]
  );

  const statsByPriority = await query(
    `SELECT priority, COUNT(*) as count FROM suggestions WHERE user_id = ? GROUP BY priority`,
    [userId]
  );

  const totalSuggestions = await query('SELECT COUNT(*) as count FROM suggestions WHERE user_id = ?', [userId]);
  
  const approvedCount = await query('SELECT COUNT(*) as count FROM suggestions WHERE user_id = ? AND status = "Approved"', [userId]);
  const pendingCount = await query('SELECT COUNT(*) as count FROM suggestions WHERE user_id = ? AND status = "Pending" OR status = "new"', [userId]);
  const rejectedCount = await query('SELECT COUNT(*) as count FROM suggestions WHERE user_id = ? AND status = "Rejected"', [userId]);

  successResponse(res, 200, 'Statistics fetched successfully', {
    total: parseInt(totalSuggestions.rows[0].count),
    approved: parseInt(approvedCount.rows[0].count),
    pending: parseInt(pendingCount.rows[0].count),
    rejected: parseInt(rejectedCount.rows[0].count),
    byStatus: statsByStatus.rows,
    byCategory: statsByCategory.rows,
    byPriority: statsByPriority.rows
  });
});

export const getPublicSuggestions = asyncHandler(async (req, res) => {
  const { status, category, page = 1, limit = 6 } = req.query;
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const offset = (parsedPage - 1) * parsedLimit;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (status && isValidStatus(status)) {
    whereClause += ` AND status = ?`;
    params.push(status);
  }

  if (category && isValidCategory(category)) {
    whereClause += ` AND category = ?`;
    params.push(category);
  }

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as count FROM suggestions ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].count);

  // Get paginated results with user info
  const result = await query(
    `SELECT s.id, s.title, s.description, s.image_url, s.category, s.priority, s.status,
            u.username, u.full_name as user_name, u.email,
            s.created_at, s.updated_at
     FROM suggestions s
     JOIN users u ON s.user_id = u.id
     ${whereClause}
     ORDER BY s.created_at DESC
     LIMIT ${parsedLimit} OFFSET ${offset}`,
    params
  );

  successResponse(res, 200, 'Public suggestions fetched successfully', {
    data: result.rows,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit)
    }
  });
});

export const getPublicStats = asyncHandler(async (req, res) => {
  const totalSuggestions = await query('SELECT COUNT(*) as count FROM suggestions');
  const totalUsers = await query('SELECT COUNT(DISTINCT user_id) as count FROM suggestions');

  successResponse(res, 200, 'Public statistics fetched successfully', {
    total: parseInt(totalSuggestions.rows[0].count),
    users: parseInt(totalUsers.rows[0].count)
  });
});