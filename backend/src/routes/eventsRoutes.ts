import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent, markAttendance, getMyAttendance } from '../controllers/eventsController.js';

const router = Router();
router.use(authenticate);

router.get('/me', getMyAttendance);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authorize('ADMIN', 'EXECUTIVE'),
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('eventDate').isISO8601().withMessage('Valid event date required.'),
  ],
  validate, createEvent
);
router.put('/:id', authorize('ADMIN', 'EXECUTIVE'), updateEvent);
router.delete('/:id', authorize('ADMIN', 'EXECUTIVE'), deleteEvent);
router.post('/:id/attendance', authorize('ADMIN', 'EXECUTIVE'), markAttendance);

export default router;