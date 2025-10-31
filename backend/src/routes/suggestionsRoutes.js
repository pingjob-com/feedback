import express from 'express';
import {
  createSuggestion,
  getSuggestions,
  getSuggestionById,
  updateSuggestion,
  deleteSuggestion,
  updateSuggestionStatus,
  getSuggestionStats,
  getPublicSuggestions,
  getPublicStats
} from '../controllers/suggestionsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', getPublicSuggestions);
router.get('/public/stats', getPublicStats);

// Protected routes (require authentication)
router.post('/', authenticate, upload.single('image'), createSuggestion);
router.get('/', authenticate, getSuggestions);
router.get('/stats', authenticate, getSuggestionStats);
router.get('/:id', authenticate, getSuggestionById);
router.put('/:id', authenticate, upload.single('image'), updateSuggestion);
router.delete('/:id', authenticate, deleteSuggestion);

// Admin routes
router.put('/:id/status', authenticate, requireAdmin, updateSuggestionStatus);

export default router;