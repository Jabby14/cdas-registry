import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createDuesPeriod, getDuesPeriods, getDues, getMyDues, markDuesPaid, getDuesSummary } from '../controllers/duesController.js';

const router = Router();
router.use(authenticate);

router.get('/me', getMyDues);
router.get('/summary', authorize('ADMIN', 'EXECUTIVE'), getDuesSummary);
router.get('/periods', authorize('ADMIN', 'EXECUTIVE'), getDuesPeriods);
router.post('/periods', authorize('ADMIN', 'EXECUTIVE'),
  [
    body('label').trim().notEmpty().withMessage('Label is required.'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive.'),
    body('dueDate').isISO8601().withMessage('Valid due date required.'),
  ],
  validate, createDuesPeriod
);
router.get('/', authorize('ADMIN', 'EXECUTIVE'), getDues);
router.patch('/:id/pay', authorize('ADMIN', 'EXECUTIVE'),
  [body('amountPaid').isFloat({ gt: 0 }).withMessage('Amount paid must be positive.')],
  validate, markDuesPaid
);

export default router;