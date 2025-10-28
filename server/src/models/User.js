const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  avatarUrl: String
}, { timestamps: true });

module.exports = model('User', userSchema);