import express from 'express'
import { checkAuth, forgotPassword, login, logout, resetPassword, signUp, updateCandidateDetails, verifyEmail } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/check-auth', verifyToken, checkAuth);

router.post('/signup', signUp);

router.post('/login', login);

router.post('/logout', logout);

router.post('/verify-email/:temporaryToken', verifyEmail);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

router.put('/update-candidate-details', updateCandidateDetails);

export default router;