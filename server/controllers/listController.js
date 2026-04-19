const TaskList = require('../models/TaskList');
const Task = require('../models/Task');

const getLists = async (req, res) => {
  try {
    const lists = await TaskList.find({ username: req.user.username }).sort({ createdAt: 1 });
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

    const newList = new TaskList({
      username: req.user.username,
      name
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

    const list = await TaskList.findOne({ _id: id, username: req.user.username });
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
    const list = await TaskList.findOneAndDelete({ _id: id, username: req.user.username });
    if (!list) return res.status(404).json({ error: 'List not found' });
    
    // Also delete all tasks associated with this list
    await Task.deleteMany({ listId: id, username: req.user.username });

    res.json({ success: true, message: 'List and associated tasks deleted' });
  } catch (error) {
    console.error('deleteList error:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
};

module.exports = {
  getLists,
  createList,
  updateList,
  deleteList
};
