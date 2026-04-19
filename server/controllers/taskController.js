const Task = require('../models/Task');

const getTasks = async (req, res) => {
  try {
    let tasks = await Task.find({ username: req.user.username }).sort({ createdAt: -1 });
    
    // Auto-migrate old tasks that lack listId but have category
    const tasksToMigrate = tasks.filter(t => !t.listId && t.category);
    if (tasksToMigrate.length > 0) {
      const TaskList = require('../models/TaskList');
      for (const t of tasksToMigrate) {
        let list = await TaskList.findOne({ username: req.user.username, name: t.category });
        if (!list) {
          list = new TaskList({ username: req.user.username, name: t.category });
          await list.save();
        }
        t.listId = list._id;
        await t.save();
      }
      // Re-fetch tasks after migration
      tasks = await Task.find({ username: req.user.username }).sort({ createdAt: -1 });
    }
    
    res.json(tasks);
  } catch (error) {
    console.error('getTasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, category, listId } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newTask = new Task({
      username: req.user.username,
      title,
      listId,
      category: category || 'General'
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, listId, isCompleted } = req.body;
    
    // Make sure we only update user's own task
    const task = await Task.findOne({ _id: id, username: req.user.username });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (title !== undefined) task.title = title;
    if (category !== undefined) task.category = category;
    if (listId !== undefined) task.listId = listId;
    if (isCompleted !== undefined) task.isCompleted = isCompleted;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('updateTask error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, username: req.user.username });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('deleteTask error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
