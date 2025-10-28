// server/src/routes/projects.js
const { Router } = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const project = await Project.create({ ...req.body, createdBy: req.user.id,members: [req.user.id] });
  res.status(201).json(await project.populate('members', 'name email'));
});

router.get('/', requireAuth, async (req, res) => {
  const projects = await Project.find({ $or: [{ members: req.user.id }, { createdBy: req.user.id }] })
    .populate('members', 'name email');
  res.json(projects);
});

router.get('/:id/board', requireAuth, async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name email'); // 👈 important
  if (!project) return res.status(404).json({ message: 'Not found' });

  const tasks = await Task.find({ project: project.id })
    .populate('assignees', 'name email');

  res.json({
    columns: project.boardColumns,
    tasks,
    members: project.members   // 👈 send members to frontend
  });
});
router.post('/:id/members', requireAuth, async (req, res) => {
  const { memberIds } = req.body; // array of user IDs
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  // Only creator or admin can add members
  if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Add new members (avoid duplicates)
  project.members = Array.from(new Set([...project.members.map(m => m.toString()), ...memberIds]));
  await project.save();

  res.json(await project.populate('members', 'name email'));
});

module.exports = router;
