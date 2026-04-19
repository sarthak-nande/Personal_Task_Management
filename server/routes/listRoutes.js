const express = require('express');
const router = express.Router();
const { getLists, createList, updateList, deleteList } = require('../controllers/listController');
const authenticate = require('../middlewares/authMiddleware');

router.get('/', authenticate, getLists);
router.post('/', authenticate, createList);
router.put('/:id', authenticate, updateList);
router.delete('/:id', authenticate, deleteList);

module.exports = router;
