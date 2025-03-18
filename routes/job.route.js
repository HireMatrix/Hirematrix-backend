import express from 'express'
import { fetchAllJobs } from '../controllers/job.controller.js';

const router = express.Router();

router.get('/jobs', fetchAllJobs);

export default router;