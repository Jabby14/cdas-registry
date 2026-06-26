import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { getMembers, getMemberById, getMyProfile, createMember, updateMember, deactivateMember } from '../controllers/membersController.js';

const router = Router();

router.use(authenticate);

router.get('/me', getMyProfile);
router.get('/', authorize('ADMIN', 'EXECUTIVE'), getMembers);
router.get('/:id', getMemberById);
router.post('/', authorize('ADMIN', 'EXECUTIVE'), [body('fullName').trim().notEmpty().withMessage('Full name is required.')], validate, createMember);
router.put('/:id', updateMember);
router.delete('/:id', authorize('ADMIN'), deactivateMember);

export default router;
