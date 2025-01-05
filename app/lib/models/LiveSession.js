// lib/models/LiveSession.js
import mongoose from 'mongoose';

const liveSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, {
  timestamps: true
});

export default mongoose.models.LiveSession || mongoose.model('LiveSession', liveSessionSchema);