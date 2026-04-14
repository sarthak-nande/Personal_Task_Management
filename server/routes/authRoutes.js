const express = require('express');
const router = express.Router();
const { loginUser, updateUser } = require('../controllers/authController');
const authenticate = require('../middlewares/authMiddleware');

router.post('/login', loginUser);
router.put('/user', authenticate, updateUser);

module.exports = router;
