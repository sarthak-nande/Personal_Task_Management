const CustomList = require('../models/CustomList');

const getLists = async (req, res) => {
  try {
    const lists = await CustomList.find({ username: req.user.username }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    console.error('getLists error:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
};

const createList = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const newList = new CustomList({
      username: req.user.username,
      name,
      items: []
    });
    await newList.save();
    res.status(201).json(newList);
  } catch (error) {
    console.error('createList error:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
};

const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const list = await CustomList.findOne({ _id: id, username: req.user.username });
    if (!list) return res.status(404).json({ error: 'List not found' });

    list.name = name;
    await list.save();
    res.json(list);
  } catch (error) {
    console.error('updateList error:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
};

const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await CustomList.findOneAndDelete({ _id: id, username: req.user.username });
    if (!list) return res.status(404).json({ error: 'List not found' });

    res.json({ success: true, message: 'List deleted' });
  } catch (error) {
    console.error('deleteList error:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
};

// Item related controls
const addItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const list = await CustomList.findOne({ _id: id, username: req.user.username });
    if (!list) return res.status(404).json({ error: 'List not found' });

    list.items.push({ title, isCompleted: false });
    await list.save();
    res.status(201).json(list.items[list.items.length - 1]);
  } catch (error) {
    console.error('addItem error:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { title, isCompleted } = req.body;

    const list = await CustomList.findOne({ _id: id, username: req.user.username });
    if (!list) return res.status(404).json({ error: 'List not found' });

    const item = list.items.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (title !== undefined) item.title = title;
    if (isCompleted !== undefined) item.isCompleted = isCompleted;

    await list.save();
    res.json(item);
  } catch (error) {
    console.error('updateItem error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

const deleteItem = async (req, res) => {
    try {
      const { id, itemId } = req.params;
  
      const list = await CustomList.findOne({ _id: id, username: req.user.username });
      if (!list) return res.status(404).json({ error: 'List not found' });
  
      list.items.pull(itemId);
      await list.save();
  
      res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
      console.error('deleteItem error:', error);
      res.status(500).json({ error: 'Failed to delete item' });
    }
  };

module.exports = {
  getLists,
  createList,
  updateList,
  deleteList,
  addItem,
  updateItem,
  deleteItem
};
