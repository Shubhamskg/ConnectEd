// models/LiveStream.js
import mongoose from 'mongoose';


const recordingSchema = new mongoose.Schema({
  filename: String,
  duration: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'error'],
    default: 'processing'
  },
  error: String
});




const participationRecordSchema = new mongoose.Schema({
  joinedAt: {
    type: Date,
    required: true
  },
  lastActive: {
    type: Date,
    required: true
  },
  leftAt: Date,
  interactions: {
    type: Number,
    default: 0
  }
}, { _id: false });

const livestreamSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
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
    type: Number,
    default: 60
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  participationRecords: {
    type: Map,
    of: participationRecordSchema
  },
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
