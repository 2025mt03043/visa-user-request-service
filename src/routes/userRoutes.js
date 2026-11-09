const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../middleware/authMiddleware');

const {
    getCurrentUser,
    updateCurrentUser
} = require('../controllers/userController');

router.get('/me', authenticateUser, getCurrentUser);
router.put('/me', authenticateUser, updateCurrentUser);

module.exports = router;