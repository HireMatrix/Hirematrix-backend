import express from 'express'
import { AllJobsAdmin, AllUsersAdmin, UploadJob } from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/jobs', verifyToken, adminAuth, AllJobsAdmin);

router.get('/users', verifyToken, adminAuth, AllUsersAdmin);

router.post('/upload-job', verifyToken, adminAuth, UploadJob);


export default router;