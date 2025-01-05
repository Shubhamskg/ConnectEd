// models/LiveStream.js
import mongoose from 'mongoose';

const livestreamSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended'],
    default: 'scheduled'
  },
  scheduledFor: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  chat: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['chat', 'question'],
      default: 'chat'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isHighlighted: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  }],
  settings: {
    isChatEnabled: {
      type: Boolean,
      default: true
    },
    isQuestionsEnabled: {
      type: Boolean,
      default: true
    },
    allowReplays: {
      type: Boolean,
      default: true
    }
  },
  statistics: {
    totalViews: {
      type: Number,
      default: 0
    },
    peakViewers: {
      type: Number,
      default: 0
    },
    averageWatchTime: {
      type: Number,
      default: 0
    },
    totalInteractions: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Add indexes
livestreamSchema.index({ teacherId: 1, status: 1 });
livestreamSchema.index({ courseId: 1 });
livestreamSchema.index({ scheduledFor: 1 });
livestreamSchema.index({ 'chat.timestamp': 1 });

export const LiveStream = mongoose.models.LiveStream || mongoose.model('LiveStream', livestreamSchema);