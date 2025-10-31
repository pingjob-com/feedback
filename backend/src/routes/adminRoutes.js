import express from 'express';
import {
  getUsers,
  deleteUser,
  updateUserRole,
  updateUserStatus,
  addDeveloperNote,
  getDeveloperNotes,
  updateDeveloperNote,
  deleteDeveloperNote,
  getAnalytics,
  exportSuggestionsCSV,
  getAllSuggestions,
  updateSuggestionStatus,
  deleteSuggestion,
  getAdminStats
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// User management
router.get('/users', getUsers);
router.put('/users/:userId', updateUserRole);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/status', updateUserStatus);

// Suggestions management
router.get('/suggestions', getAllSuggestions);
router.put('/suggestions/:suggestionId', updateSuggestionStatus);
router.delete('/suggestions/:suggestionId', deleteSuggestion);

// Admin stats
router.get('/stats', getAdminStats);

// Developer notes
router.post('/notes/:suggestionId', addDeveloperNote);
router.get('/notes/:suggestionId', getDeveloperNotes);
router.put('/notes/:noteId', updateDeveloperNote);
router.delete('/notes/:noteId', deleteDeveloperNote);

// Analytics
router.get('/analytics', getAnalytics);
router.get('/export/csv', exportSuggestionsCSV);

export default router;