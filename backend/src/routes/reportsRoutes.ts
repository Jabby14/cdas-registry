import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getDashboardStats, getAttendanceSummary, exportMembers } from '../controllers/reportsController.js';

const router = Router();
router.use(authenticate, authorize('ADMIN', 'EXECUTIVE'));

router.get('/dashboard', getDashboardStats);
router.get('/attendance-summary', getAttendanceSummary);
router.get('/members/export', exportMembers);

export default router;