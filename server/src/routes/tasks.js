// server/src/routes/tasks.js
const { Router } = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { requireAuth } = require('../middleware/auth');
const { notifyProject } = require('../services/notifications');

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const { project, title, status } = req.body;
  const proj = await Project.findById(project);
  if (!proj) return res.status(404).json({ message: 'Project not found' });
  if (!proj.boardColumns.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const maxOrder = await Task.find({ project, status }).sort({ order: -1 }).limit(1);
  const order = maxOrder[0]?.order + 1 || 0;

  const task = await Task.create({ ...req.body, createdBy: req.user.id, order });
  notifyProject(project, { type: 'task_created', taskId: task.id, title: task.title });
  res.status(201).json(task);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ message: 'Not found' });
  res.json(task);
});

router.post('/reorder', requireAuth, async (req, res) => {
  const { projectId, sourceStatus, destStatus, taskId, destIndex } = req.body;
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (sourceStatus === destStatus) {
    const tasks = await Task.find({ project: projectId, status: sourceStatus }).sort({ order: 1 });
    const moved = tasks.find(t => t.id === taskId);
    tasks.splice(tasks.indexOf(moved), 1);
    tasks.splice(destIndex, 0, moved);
    await Promise.all(tasks.map((t, i) => Task.findByIdAndUpdate(t.id, { order: i })));
  } else {
    task.status = destStatus;
    await task.save();
    const destTasks = await Task.find({ project: projectId, status: destStatus }).sort({ order: 1 });
    destTasks.splice(destIndex, 0, task);
    await Promise.all(destTasks.map((t, i) => Task.findByIdAndUpdate(t.id, { order: i })));
  }

  notifyProject(projectId, { type: 'task_reordered', taskId, destStatus, destIndex });
  res.json({ ok: true });
});

module.exports = router;
