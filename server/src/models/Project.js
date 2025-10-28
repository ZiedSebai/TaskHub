const { Schema, model, Types } = require('mongoose');

const projectSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Types.ObjectId, ref: 'User' }],
  status: { type: String, default: 'active' },
  startDate: Date,
  endDate: Date,
  boardColumns: { type: [String], default: ['Backlog', 'In Progress', 'Review', 'Done'] }
}, { timestamps: true });

module.exports = model('Project', projectSchema);