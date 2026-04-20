const express = require('express');
const router = express.Router();
const { getLists, createList, updateList, deleteList, addItem, updateItem, deleteItem } = require('../controllers/customListController');
const authenticate = require('../middlewares/authMiddleware');

router.get('/', authenticate, getLists);
router.post('/', authenticate, createList);
router.put('/:id', authenticate, updateList);
router.delete('/:id', authenticate, deleteList);

router.post('/:id/items', authenticate, addItem);
router.put('/:id/items/:itemId', authenticate, updateItem);
router.delete('/:id/items/:itemId', authenticate, deleteItem);

module.exports = router;
