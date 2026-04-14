const express = require('express');
const router = express.Router();
const { getWallet, updateWallet } = require('../controllers/walletController');
const authenticate = require('../middlewares/authMiddleware');

router.get('/', authenticate, getWallet);
router.put('/', authenticate, updateWallet);

module.exports = router;
