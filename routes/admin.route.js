import express from 'express'
import { AllJobsAdmin, AllUsersAdmin, DeleteJob, DeleteUser, GetCachedJobs, GetJobsFromUrl, UploadJob, UploadMultipleJobs } from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// jobs - routes
router.get('/jobs', verifyToken, adminAuth, AllJobsAdmin);

router.post('/upload-job', verifyToken, adminAuth, UploadJob);

router.post('/upload-multiple-jobs', verifyToken, adminAuth, UploadMultipleJobs);

router.delete('/delete-job', verifyToken, adminAuth, DeleteJob);

// users - routes
router.get('/users', verifyToken, adminAuth, AllUsersAdmin);

router.delete('/delete-user', verifyToken, adminAuth, DeleteUser);

// scraping - route
router.get('/web-scraping', verifyToken, adminAuth, GetJobsFromUrl);

router.get('/scraped-data', verifyToken, adminAuth, GetCachedJobs);

export default router;