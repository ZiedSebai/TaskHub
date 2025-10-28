const { Schema, model, Types } = require('mongoose');

const subtaskSchema = new Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false }
}, { _id: false });

const activitySchema = new Schema({
  by: { type: Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  at: { type: Date, default: Date.now }
}, { _id: false });

const taskSchema = new Schema({
  project: { type: Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: String,
  assignees: [{ type: Types.ObjectId, ref: 'User' }],
  status: { type: String, required: true },
  order: { type: Number, default: 0 },
  deadline: Date,
  subtasks: [subtaskSchema],
  activity: [activitySchema],
  createdBy: { type: Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = model('Task', taskSchema);